import Tcc from '../models/tcc.js';
import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Usuario from '../models/usuario.js';
import Configuracao from '../models/configuracao.js';
import Ideia from '../models/ideia.js';
import { ehDono, lista, regexSegura } from '../utils/texto.js';
import {
  acoesAvaliacao,
  descricaoStatus,
  validarTransicao,
  visivelParaProfessor
} from '../utils/fluxoTcc.js';
import { alunoPodeEnviarPara, podeEnviarTcc } from '../utils/vinculoAcademico.js';
import { bancoDisponivel } from '../config/conexao.js';
import { registrarVisualizacao } from '../utils/metricasTcc.js';

function falha(mensagem, status = 400) {
  return Object.assign(new Error(mensagem), { status });
}

async function validarCursoTurma(curso, turma, ativos = true) {
  const [cursoValido, turmaValida] = await Promise.all([
    Curso.exists({ _id: curso, ...(ativos ? { ativo: true } : {}) }),
    Turma.exists({
      _id: turma,
      curso,
      ...(ativos ? { ativa: true } : {})
    })
  ]);

  if (!cursoValido || !turmaValida) {
    throw falha('O curso e a turma selecionados não formam um vínculo válido.');
  }
}

async function validarOrientador(orientador) {
  const orientadorValido = await Usuario.exists({
    _id: orientador,
    perfil: 'professor',
    aprovado: true,
    ativo: true
  });

  if (!orientadorValido) {
    throw falha('Selecione um professor orientador ativo e aprovado.');
  }
}

async function opcoesFormulario(req, tcc = null) {
  const conta = await Usuario.findById(req.session.usuario.id)
    .select('perfil curso turma');
  if (!conta) throw falha('Sua conta não foi encontrada.', 401);

  const vinculoAluno = conta.perfil === 'aluno';
  let filtroCurso = { ativo: true };
  let filtroTurma = { ativa: true };

  if (vinculoAluno) {
    const curso = tcc?.curso || conta.curso;
    const turma = tcc?.turma || conta.turma;

    if (!curso || !turma) {
      throw falha(
        'O administrador precisa vincular sua conta a um curso e uma turma antes do envio de TCC.',
        403
      );
    }

    if (!tcc) await validarCursoTurma(curso, turma, true);
    filtroCurso = { _id: curso };
    filtroTurma = { _id: turma, curso };
  }

  const [cursos, turmas, professores] = await Promise.all([
    Curso.find(filtroCurso),
    Turma.find(filtroTurma).populate('curso'),
    Usuario.find({ perfil: 'professor', aprovado: true, ativo: true })
  ]);

  return { cursos, turmas, professores, vinculoAluno, conta };
}

export default class TccController {
  constructor(caminhoBase = 'tcc/') {
    this.caminhoBase = caminhoBase;

    this.openAdd = async (req, res) => {
      if (!podeEnviarTcc(req.session.usuario)) {
        throw falha('Somente alunos podem enviar TCCs.', 403);
      }

      const {
        cursos,
        turmas,
        professores,
        vinculoAluno
      } = await opcoesFormulario(req);

      res.render(this.caminhoBase + 'add', {
        title: 'Enviar TCC',
        cursos,
        turmas,
        professores,
        tcc: null,
        vinculoAluno
      });
    };

    this.add = async (req, res) => {
      const pdf = req.files?.pdf?.[0];
      const capa = req.files?.capa?.[0];
      const status = req.body.acao === 'enviar' ? 'Enviado' : 'Rascunho';
      const conta = await Usuario.findById(req.session.usuario.id)
        .select('perfil curso turma');

      if (!conta) throw falha('Sua conta não foi encontrada.', 401);
      if (!podeEnviarTcc(conta)) {
        throw falha('Somente alunos podem enviar TCCs.', 403);
      }
      if (!alunoPodeEnviarPara(conta, req.body.curso, req.body.turma)) {
        throw falha(
          'Alunos só podem enviar TCC para o curso e a turma vinculados à sua conta.',
          403
        );
      }

      await Promise.all([
        validarCursoTurma(req.body.curso, req.body.turma, true),
        validarOrientador(req.body.orientador)
      ]);

      if (!lista(req.body.autores).length) {
        throw new Error('Informe pelo menos um autor.');
      }
      if (status === 'Enviado' && !pdf) {
        throw new Error('Anexe o PDF antes de enviar para avaliação.');
      }
      if (status === 'Enviado' && req.body.termoAutorizacao !== 'true') {
        throw new Error('Aceite o termo de autorização antes de enviar o TCC.');
      }
      if (pdf && pdf.buffer.subarray(0, 5).toString() !== '%PDF-') {
        throw new Error('O arquivo enviado não é um PDF válido.');
      }

      const tcc = await Tcc.create({
        titulo: req.body.titulo,
        resumo: req.body.resumo,
        palavrasChave: lista(req.body.palavrasChave),
        autores: lista(req.body.autores),
        alunoResponsavel: req.session.usuario.id,
        orientador: req.body.orientador,
        curso: req.body.curso,
        turma: req.body.turma,
        ano: req.body.ano,
        area: req.body.area,
        status,
        ocultarAutores: req.body.ocultarAutores === 'true',
        termoAutorizacao: {
          aceito: req.body.termoAutorizacao === 'true',
          aceitoEm: req.body.termoAutorizacao === 'true' ? new Date() : undefined
        },
        pdf: pdf ? {
          dados: pdf.buffer,
          nome: pdf.originalname,
          mime: pdf.mimetype,
          tamanho: pdf.size
        } : undefined,
        capa: capa ? {
          dados: capa.buffer,
          mime: capa.mimetype
        } : undefined,
        historico: [{
          status,
          observacao: status === 'Enviado'
            ? 'Versão final enviada ao professor orientador.'
            : 'Rascunho criado.',
          usuario: req.session.usuario.id
        }]
      });

      req.flash(
        'sucesso',
        status === 'Enviado' ? 'TCC enviado para avaliação.' : 'Rascunho salvo.'
      );
      res.redirect('/tcc/edt/' + tcc.id);
    };

    this.list = async (req, res) => {
      const usuario = req.session.usuario;
      let filtro = { alunoResponsavel: usuario.id };

      if (usuario.perfil === 'administrador') filtro = {};
      if (usuario.perfil === 'professor') {
        filtro = {
          orientador: usuario.id,
          status: { $ne: 'Rascunho' }
        };
      }

      const tccs = await Tcc.find(filtro)
        .populate('curso turma orientador alunoResponsavel')
        .sort({ updatedAt: -1 });

      res.render(this.caminhoBase + 'lst', {
        title: 'Meus TCCs',
        tccs
      });
    };

    this.openEdt = async (req, res) => {
      const tcc = await Tcc.findById(req.params.id)
        .populate('historico.usuario liberadoPor');
      if (!tcc) throw new Error('TCC não encontrado.');

      const usuario = req.session.usuario;
      const acessoProfessor = usuario.perfil === 'professor'
        && ehDono(tcc.orientador, usuario);
      const acessoAdmin = usuario.perfil === 'administrador';

      if (acessoProfessor && !visivelParaProfessor(tcc.status)) {
        throw falha(
          'O aluno ainda não enviou este rascunho para avaliação.',
          403
        );
      }
      if (!ehDono(tcc.alunoResponsavel, usuario) && !acessoProfessor && !acessoAdmin) {
        throw falha('Acesso negado.', 403);
      }

      const {
        cursos,
        turmas,
        professores,
        vinculoAluno
      } = await opcoesFormulario(req, tcc);

      res.render(this.caminhoBase + 'edt', {
        title: 'Editar TCC',
        tcc,
        cursos,
        turmas,
        professores,
        vinculoAluno,
        editavel: ehDono(tcc.alunoResponsavel, usuario)
          && ['Rascunho', 'Correções solicitadas'].includes(tcc.status),
        acoesAvaliacao: acoesAvaliacao(tcc.status, usuario.perfil),
        descricaoStatus: descricaoStatus(tcc.status)
      });
    };

    this.edt = async (req, res) => {
      const tcc = await Tcc.findById(req.params.id);
      const alunoPodeEditar = tcc
        && ehDono(tcc.alunoResponsavel, req.session.usuario)
        && ['Rascunho', 'Correções solicitadas'].includes(tcc.status);
      if (!alunoPodeEditar) {
        throw falha('Este trabalho não pode ser editado.', 403);
      }

      const conta = await Usuario.findById(req.session.usuario.id)
        .select('perfil');
      const curso = conta?.perfil === 'aluno' ? tcc.curso : req.body.curso;
      const turma = conta?.perfil === 'aluno' ? tcc.turma : req.body.turma;

      await Promise.all([
        validarCursoTurma(curso, turma, false),
        validarOrientador(req.body.orientador)
      ]);

      Object.assign(tcc, {
        titulo: req.body.titulo,
        resumo: req.body.resumo,
        palavrasChave: lista(req.body.palavrasChave),
        autores: lista(req.body.autores),
        orientador: req.body.orientador,
        curso,
        turma,
        ano: req.body.ano,
        area: req.body.area,
        ocultarAutores: req.body.ocultarAutores === 'true'
      });

      if (req.body.termoAutorizacao === 'true' && !tcc.termoAutorizacao.aceito) {
        tcc.termoAutorizacao = {
          aceito: true,
          aceitoEm: new Date()
        };
      }

      const pdf = req.files?.pdf?.[0];
      const capa = req.files?.capa?.[0];

      if (pdf && pdf.buffer.subarray(0, 5).toString() !== '%PDF-') {
        throw new Error('O arquivo enviado não é um PDF válido.');
      }
      if (pdf) {
        tcc.pdf = {
          dados: pdf.buffer,
          nome: pdf.originalname,
          mime: pdf.mimetype,
          tamanho: pdf.size
        };
      }
      if (capa) {
        tcc.capa = {
          dados: capa.buffer,
          mime: capa.mimetype
        };
      }

      if (req.body.acao === 'enviar') {
        if (!tcc.pdf?.dados) throw new Error('Anexe o PDF antes de enviar.');
        if (!tcc.termoAutorizacao.aceito) {
          throw new Error('Aceite o termo de autorização antes de enviar o TCC.');
        }

        tcc.status = tcc.status === 'Correções solicitadas' ? 'Reenviado' : 'Enviado';
        tcc.historico.push({
          status: tcc.status,
          observacao: 'Versão final enviada ao professor orientador.',
          usuario: req.session.usuario.id
        });
      }

      await tcc.save();
      req.flash('sucesso', 'TCC atualizado.');
      res.redirect('/tcc/edt/' + tcc.id);
    };

    this.revisar = async (req, res) => {
      const tcc = await Tcc.findById(req.params.id);
      if (!tcc) throw new Error('TCC não encontrado.');

      const status = req.body.status;
      if (!validarTransicao(tcc.status, status, req.session.usuario.perfil)) {
        throw new Error(
          `Não é permitido alterar de “${tcc.status}” para “${status}”.`
        );
      }
      if (
        req.session.usuario.perfil === 'professor'
        && !ehDono(tcc.orientador, req.session.usuario)
      ) {
        throw falha('Este trabalho não está sob sua orientação.', 403);
      }
      if (status === 'Publicado' && !tcc.termoAutorizacao.aceito) {
        throw new Error(
          'O aluno ainda não aceitou o termo de autorização para publicação.'
        );
      }

      tcc.status = status;
      if (status === 'Publicado') {
        tcc.publicadoEm = new Date();
        tcc.liberadoEm = new Date();
        tcc.liberadoPor = req.session.usuario.id;
      }

      const observacao = req.body.observacao || (
        status === 'Publicado'
          ? 'Professor orientador liberou o TCC para o catálogo público.'
          : 'Avaliação atualizada.'
      );
      tcc.historico.push({
        status,
        observacao,
        usuario: req.session.usuario.id
      });

      await tcc.save();
      req.flash('sucesso', 'Avaliação registrada.');
      res.redirect('/tcc/edt/' + tcc.id);
    };

    this.del = async (req, res) => {
      const tcc = await Tcc.findById(req.params.id);
      const podeExcluir = tcc && (
        ehDono(tcc.alunoResponsavel, req.session.usuario)
        || req.session.usuario.perfil === 'administrador'
      );
      if (!podeExcluir) throw falha('Acesso negado.', 403);
      if (req.session.usuario.perfil !== 'administrador' && tcc.status !== 'Rascunho') {
        throw new Error('Somente rascunhos podem ser excluídos.');
      }

      await Promise.all([
        tcc.deleteOne(),
        Usuario.updateMany({}, { $pull: { favoritosTcc: tcc.id } }),
        Ideia.updateMany(
          { tccVinculado: tcc.id },
          { $unset: { tccVinculado: 1 } }
        )
      ]);

      req.flash('sucesso', 'TCC excluído.');
      res.redirect('/tcc/lst');
    };

    this.catalogo = async (req, res) => {
      res.set('Cache-Control', 'no-store');

      if (!bancoDisponivel()) {
        return res.render('catalogo-db', {
          title: 'Acervo de TCCs',
          resultado: [],
          cursos: [],
          turmas: [],
          orientadores: [],
          areas: [],
          query: req.query
        });
      }

      const {
        q = '',
        curso = '',
        turma = '',
        ano = '',
        area = '',
        orientador = '',
        ordem = 'recentes'
      } = req.query;
      const filtro = { status: 'Publicado' };

      if (q) {
        const busca = new RegExp(regexSegura(q), 'i');
        const orientadoresEncontrados = await Usuario.find({
          perfil: 'professor',
          nome: busca
        }).distinct('_id');

        filtro.$or = [
          { titulo: busca },
          { resumo: busca },
          { palavrasChave: busca },
          { autores: busca },
          { orientador: { $in: orientadoresEncontrados } }
        ];
      }
      if (curso) filtro.curso = curso;
      if (turma) filtro.turma = turma;
      if (ano) filtro.ano = Number(ano);
      if (area) filtro.area = area;
      if (orientador) filtro.orientador = orientador;

      const ordenacao = ordem === 'az'
        ? { titulo: 1 }
        : ordem === 'visualizados'
          ? { visualizacoes: -1 }
          : { publicadoEm: -1 };

      const [resultado, cursos, turmas, orientadores, areas] = await Promise.all([
        Tcc.find(filtro)
          .select('-pdf.dados -capa.dados')
          .populate('curso turma orientador')
          .sort(ordenacao),
        Curso.find({ ativo: true }),
        Turma.find({ ativa: true }),
        Usuario.find({ perfil: 'professor', aprovado: true }),
        Tcc.distinct('area', { status: 'Publicado' })
      ]);

      return res.render('catalogo-db', {
        title: 'Acervo de TCCs',
        resultado,
        cursos,
        turmas,
        orientadores,
        areas,
        query: req.query
      });
    };

    this.detalhes = async (req, res) => {
      if (!bancoDisponivel()) {
        return res.status(404).render('404', {
          title: 'Trabalho não encontrado'
        });
      }

      const tcc = await registrarVisualizacao(Tcc, req.params.id);
      if (!tcc) {
        return res.status(404).render('404', {
          title: 'Trabalho não encontrado'
        });
      }

      const [relacionados, favorito] = await Promise.all([
        Tcc.find({
          _id: { $ne: tcc.id },
          status: 'Publicado',
          $or: [
            ...(tcc.curso ? [{ curso: tcc.curso._id }] : []),
            { area: tcc.area }
          ]
        })
          .select('-pdf.dados -capa.dados')
          .populate('curso')
          .limit(3),
        req.session.usuario
          ? Usuario.exists({
            _id: req.session.usuario.id,
            favoritosTcc: tcc.id
          })
          : false
      ]);

      res.set('Cache-Control', 'no-store');
      return res.render('detalhes-db', {
        title: tcc.titulo,
        tcc,
        relacionados,
        favorito: Boolean(favorito)
      });
    };

    this.capa = async (req, res) => {
      if (!bancoDisponivel()) return res.status(404).end();

      const tcc = await Tcc.findOne({
        _id: req.params.id,
        status: 'Publicado'
      }).select('capa');
      if (!tcc?.capa?.dados) return res.status(404).end();

      return res.type(tcc.capa.mime).send(tcc.capa.dados);
    };

    this.pdf = async (req, res) => {
      if (!bancoDisponivel()) return res.status(404).end();

      const tcc = await Tcc.findOne({
        _id: req.params.id,
        status: 'Publicado'
      }).select('pdf');
      if (!tcc?.pdf?.dados) return res.status(404).end();

      const nome = tcc.pdf.nome.replace(/["\r\n]/g, '');
      return res
        .type('pdf')
        .set('Content-Disposition', `inline; filename="${nome}"`)
        .send(tcc.pdf.dados);
    };

    this.download = async (req, res) => {
      if (!bancoDisponivel()) return res.status(404).end();

      const config = await Configuracao.findOne({ chave: 'geral' });
      if (config && !config.permitirDownloads) {
        throw falha('Downloads estão temporariamente desativados.', 403);
      }

      const tcc = await Tcc.findOneAndUpdate(
        { _id: req.params.id, status: 'Publicado' },
        { $inc: { downloads: 1 } },
        { new: true }
      ).select('pdf');
      if (!tcc?.pdf?.dados) return res.status(404).end();

      const nome = tcc.pdf.nome.replace(/["\r\n]/g, '');
      return res
        .type('pdf')
        .set('Content-Disposition', `attachment; filename="${nome}"`)
        .send(tcc.pdf.dados);
    };
  }
}
