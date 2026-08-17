import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Tcc from '../models/tcc.js';
import Ideia from '../models/ideia.js';
import Usuario from '../models/usuario.js';

function falha(mensagem, status = 400) {
    return Object.assign(new Error(mensagem), { status });
}

export default class CursoController{
    constructor(caminhoBase='admin/'){
        this.caminhoBase = caminhoBase;

        this.list = async(req, res)=>{
            const [cursos, turmas] = await Promise.all([
                Curso.find().sort({ ativo: -1, nome: 1 }),
                Turma.find().populate('curso').sort({ ativa: -1, ano: -1, nome: 1 })
            ]);

            res.render(this.caminhoBase + 'cursos', {
                title: 'Cursos e turmas',
                cursos,
                turmas
            });
        };

        this.add = async(req, res)=>{
            await Curso.create({
                nome: req.body.nome,
                sigla: req.body.sigla,
                descricao: req.body.descricao
            });
            req.flash('sucesso', 'Curso criado.');
            res.redirect('/admin/cursos');
        };

        this.edt = async(req, res)=>{
            await Curso.findByIdAndUpdate(
                req.params.id,
                {
                    nome: req.body.nome,
                    sigla: req.body.sigla,
                    descricao: req.body.descricao,
                    ativo: req.body.ativo === 'true'
                },
                { runValidators: true }
            );
            req.flash('sucesso', 'Curso atualizado.');
            res.redirect('/admin/cursos');
        };

        this.del = async(req, res)=>{
            const curso = await Curso.findById(req.params.id);
            if (!curso) throw falha('Curso não encontrado.', 404);

            // Funcionalidade exclusiva do AcervoTCC: preserva vínculos acadêmicos antes da exclusão.
            const [turmas, tccs, ideias, alunos] = await Promise.all([
                Turma.countDocuments({ curso: curso.id }),
                Tcc.countDocuments({ curso: curso.id }),
                Ideia.countDocuments({ curso: curso.id }),
                Usuario.countDocuments({ curso: curso.id })
            ]);

            if (turmas + tccs + ideias + alunos) {
                curso.ativo = false;
                await curso.save();
                req.flash(
                    'sucesso',
                    'O curso possui vínculos e foi desativado. Remova os vínculos antes de excluí-lo definitivamente.'
                );
            } else {
                await curso.deleteOne();
                req.flash('sucesso', 'Curso excluído.');
            }

            res.redirect('/admin/cursos');
        };
    }
}
