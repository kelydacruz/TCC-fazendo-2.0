// Funcionalidade exclusiva do AcervoTCC: Banco de Ideias com escolha e atualização de status por alunos.
import Ideia, { STATUS_IDEIA } from '../models/ideia.js';
import Comentario from '../models/comentario.js';
import Curso from '../models/curso.js';
import Tcc from '../models/tcc.js';
import Usuario from '../models/usuario.js';
import { ehDono, lista, podeModerar, regexSegura } from '../utils/texto.js';
import { bancoDisponivel } from '../config/conexao.js';
import { dadosDeUsoIdeia, descricaoUsoIdeia } from '../utils/usoIdeia.js';
import {
    acoesIdeiaAluno,
    alunoResponsavelPelaIdeia,
    transicaoAluno
} from '../utils/fluxoIdeia.js';

const STATUS_MODERACAO = ['Disponível', 'Em análise', 'Arquivada'];

function falha(mensagem, status = 400) {
    return Object.assign(new Error(mensagem), { status });
}

export default class IdeiaController{
    constructor(caminhoBase='ideia/'){
        this.caminhoBase = caminhoBase;

        this.list = async(req, res)=>{
            if (!bancoDisponivel()) {
                return res.render(this.caminhoBase + 'lst', {
                    title: 'Banco de Ideias',
                    ideias: [],
                    cursos: [],
                    areas: [],
                    statusIdeia: STATUS_IDEIA,
                    query: req.query,
                    descricaoUsoIdeia
                });
            }

            const {
                q = '',
                curso = '',
                area = '',
                dificuldade = '',
                status = '',
                dataInicio = '',
                dataFim = '',
                ordem = 'recentes'
            } = req.query;
            const filtro = {};

            if (q) {
                const busca = new RegExp(regexSegura(q), 'i');
                filtro.$or = [
                    { titulo: busca },
                    { descricao: busca },
                    { problema: busca }
                ];
            }
            if (curso) filtro.curso = curso;
            if (area) filtro.area = area;
            if (dificuldade) filtro.dificuldade = dificuldade;
            if (status) filtro.status = status;

            if (dataInicio || dataFim) {
                filtro.createdAt = {};
                if (dataInicio) {
                    const inicio = new Date(`${dataInicio}T00:00:00`);
                    if (!Number.isNaN(inicio.getTime())) filtro.createdAt.$gte = inicio;
                }
                if (dataFim) {
                    const fim = new Date(`${dataFim}T23:59:59.999`);
                    if (!Number.isNaN(fim.getTime())) filtro.createdAt.$lte = fim;
                }
                if (!Object.keys(filtro.createdAt).length) delete filtro.createdAt;
            }

            const ideias = await Ideia.find(filtro)
                .populate('curso autor responsavelUso tccVinculado')
                .sort(ordem === 'antigas' ? { createdAt: 1 } : { createdAt: -1 });
            const [cursos, areas] = await Promise.all([
                Curso.find({ ativo: true }).sort({ nome: 1 }),
                Ideia.distinct('area')
            ]);

            return res.render(this.caminhoBase + 'lst', {
                title: 'Banco de Ideias',
                ideias,
                cursos,
                areas: areas.sort(),
                statusIdeia: STATUS_IDEIA,
                query: req.query,
                descricaoUsoIdeia
            });
        };

        this.detalhes = async(req, res)=>{
            if (!bancoDisponivel()) {
                return res.status(404).render('404', { title: 'Ideia não encontrada' });
            }

            const ideia = await Ideia.findById(req.params.id)
                .populate('curso autor responsavelUso tccVinculado');
            if (!ideia) {
                return res.status(404).render('404', { title: 'Ideia não encontrada' });
            }

            const [comentarios, favorito] = await Promise.all([
                Comentario.find({ ideia: ideia.id, oculto: false })
                    .populate('autor')
                    .sort({ createdAt: 1 }),
                Usuario.exists({
                    _id: req.session.usuario.id,
                    favoritosIdeia: ideia.id
                })
            ]);

            return res.render(this.caminhoBase + 'detalhes', {
                title: ideia.titulo,
                ideia,
                comentarios,
                favorito: Boolean(favorito),
                descricaoUso: descricaoUsoIdeia(ideia),
                acoesAluno: acoesIdeiaAluno(ideia, req.session.usuario),
                alunoResponsavel: alunoResponsavelPelaIdeia(ideia, req.session.usuario)
            });
        };

        this.openAdd = async(req, res)=>{
            const cursos = await Curso.find({ ativo: true });
            res.render(this.caminhoBase + 'add', {
                title: 'Publicar ideia',
                cursos
            });
        };

        this.add = async(req, res)=>{
            const ideia = await Ideia.create({
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                problema: req.body.problema,
                curso: req.body.curso,
                area: req.body.area,
                dificuldade: req.body.dificuldade,
                conhecimentos: lista(req.body.conhecimentos),
                autor: req.session.usuario.id
            });

            req.flash('sucesso', 'Ideia publicada.');
            res.redirect('/ideias/' + ideia.id);
        };

        this.openEdt = async(req, res)=>{
            const ideia = await Ideia.findById(req.params.id);
            const podeEditar = ideia && (
                ehDono(ideia.autor, req.session.usuario)
                || podeModerar(req.session.usuario)
            );
            if (!podeEditar) throw falha('Acesso negado.', 403);

            const [cursos, tccs] = await Promise.all([
                Curso.find({ ativo: true }),
                Tcc.find({ status: 'Publicado' }).select('titulo')
            ]);
            const statusModeracao = [...new Set([ideia.status, ...STATUS_MODERACAO])];

            res.render(this.caminhoBase + 'edt', {
                title: 'Editar ideia',
                ideia,
                cursos,
                tccs,
                statusModeracao
            });
        };

        this.edt = async(req, res)=>{
            const ideia = await Ideia.findById(req.params.id);
            if (!ideia) throw falha('Ideia não encontrada.', 404);

            const moderador = podeModerar(req.session.usuario);
            const donoPodeEditar = ehDono(ideia.autor, req.session.usuario)
                && ideia.status === 'Disponível';
            if (!moderador && !donoPodeEditar) {
                throw falha('Esta ideia não pode ser editada.', 403);
            }

            Object.assign(ideia, {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                problema: req.body.problema,
                curso: req.body.curso,
                area: req.body.area,
                dificuldade: req.body.dificuldade,
                conhecimentos: lista(req.body.conhecimentos)
            });

            if (moderador && req.body.status) {
                const statusInstitucional = STATUS_MODERACAO.includes(req.body.status);
                if (!statusInstitucional && req.body.status !== ideia.status) {
                    throw falha(
                        'Os status de utilização são controlados pelos alunos responsáveis.',
                        403
                    );
                }

                if (
                    req.body.tccVinculado
                    && !await Tcc.exists({ _id: req.body.tccVinculado, status: 'Publicado' })
                ) {
                    throw new Error('Selecione um TCC publicado válido.');
                }

                if (statusInstitucional) {
                    const uso = dadosDeUsoIdeia(req.body.status);
                    ideia.status = req.body.status;
                    ideia.responsavelUso = uso.responsavelUso;
                    ideia.tccVinculado = uso.tccVinculado;
                } else if (ideia.status === 'Utilizada') {
                    ideia.tccVinculado = req.body.tccVinculado || undefined;
                }
                ideia.moderada = true;
            }

            await ideia.save();
            req.flash('sucesso', 'Ideia atualizada.');
            res.redirect('/ideias/' + ideia.id);
        };

        this.statusAluno = async(req, res)=>{
            const ideia = await Ideia.findById(req.params.id)
                .select('status responsavelUso');
            if (!ideia) throw falha('Ideia não encontrada.', 404);

            const transicao = transicaoAluno(ideia.status, req.body.acao);
            if (!transicao) {
                throw falha('Esta alteração de status não está disponível.', 403);
            }

            const usuarioId = req.session.usuario.id;
            const filtro = { _id: ideia.id, status: ideia.status };
            if (req.body.acao === 'reservar') {
                filtro.$or = [
                    { responsavelUso: { $exists: false } },
                    { responsavelUso: null }
                ];
            } else {
                filtro.responsavelUso = usuarioId;
            }

            const atualizacao = transicao.para === 'Disponível'
                ? {
                    $set: { status: 'Disponível' },
                    $unset: { responsavelUso: 1, tccVinculado: 1 }
                }
                : {
                    $set: { status: transicao.para, responsavelUso: usuarioId },
                    $unset: { tccVinculado: 1 }
                };

            const atualizada = await Ideia.findOneAndUpdate(
                filtro,
                atualizacao,
                { new: true }
            );
            if (!atualizada) {
                const mensagem = req.body.acao === 'reservar'
                    ? 'Outro aluno acabou de escolher esta ideia.'
                    : 'Somente o aluno responsável pode alterar este status.';
                throw falha(mensagem, 409);
            }

            const mensagens = {
                reservar: 'Ideia reservada para você.',
                iniciar: 'Ideia marcada como em desenvolvimento.',
                liberar: 'Ideia liberada para outros alunos.',
                utilizar: 'Ideia marcada como utilizada.'
            };
            req.flash('sucesso', mensagens[req.body.acao]);
            res.redirect('/ideias/' + ideia.id);
        };

        this.del = async(req, res)=>{
            const ideia = await Ideia.findById(req.params.id);
            const podeExcluir = ideia && (
                ehDono(ideia.autor, req.session.usuario)
                || req.session.usuario.perfil === 'administrador'
            );
            if (!podeExcluir) throw falha('Acesso negado.', 403);

            if (
                req.session.usuario.perfil !== 'administrador'
                && ideia.status !== 'Disponível'
            ) {
                throw new Error('Somente ideias disponíveis podem ser excluídas.');
            }

            await Promise.all([
                Comentario.deleteMany({ ideia: ideia.id }),
                Usuario.updateMany({}, { $pull: { favoritosIdeia: ideia.id } })
            ]);
            await ideia.deleteOne();
            req.flash('sucesso', 'Ideia excluída.');
            res.redirect('/ideias');
        };

        this.favorito = async(req, res)=>{
            const [usuario, ideia] = await Promise.all([
                Usuario.findById(req.session.usuario.id),
                Ideia.exists({ _id: req.params.id, status: { $ne: 'Arquivada' } })
            ]);
            if (!usuario) throw falha('Sua conta não foi encontrada.', 404);
            if (!ideia) throw falha('Esta ideia não está disponível para favoritos.', 404);

            const tem = usuario.favoritosIdeia.some(id => String(id) === req.params.id);
            const alteracao = tem
                ? { $pull: { favoritosIdeia: req.params.id } }
                : { $addToSet: { favoritosIdeia: req.params.id } };

            await Usuario.findByIdAndUpdate(usuario.id, alteracao);
            req.flash(
                'sucesso',
                tem ? 'Ideia removida dos favoritos.' : 'Ideia salva nos favoritos.'
            );
            res.redirect(req.get('referer') || '/favoritos');
        };
    }
}
