import Usuario from '../models/usuario.js';
import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Tcc from '../models/tcc.js';
import Ideia from '../models/ideia.js';
import Comentario from '../models/comentario.js';
import Denuncia from '../models/denuncia.js';

function falha(mensagem, status = 400) {
  return Object.assign(new Error(mensagem), { status });
}

export default class UsuarioController {
  constructor(caminhoBase = 'admin/') {
    this.caminhoBase = caminhoBase;

    this.list = async (req, res) => {
      const [usuarios, cursos, turmas] = await Promise.all([
        Usuario.find().populate('curso turma').sort({ aprovado: 1, createdAt: -1 }),
        Curso.find({ ativo: true }).sort({ nome: 1 }),
        Turma.find({ ativa: true }).populate('curso').sort({ ano: -1, nome: 1 })
      ]);

      res.render(this.caminhoBase + 'usuarios', {
        title: 'Gerenciar usuários',
        usuarios,
        cursos,
        turmas
      });
    };

    this.edt = async (req, res) => {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) throw falha('Usuário não encontrado.', 404);

      const perfil = ['aluno', 'professor', 'administrador'].includes(req.body.perfil)
        ? req.body.perfil
        : usuario.perfil;
      const aprovado = req.body.aprovado === 'true';

      if (
        usuario.id === req.session.usuario.id
        && (perfil !== 'administrador' || !aprovado || req.body.ativo !== 'true')
      ) {
        throw falha('Sua própria conta deve permanecer como administrador ativo e aprovado.');
      }

      const alteracao = {
        $set: {
          aprovado,
          ativo: req.body.ativo === 'true',
          emailConfirmado: req.body.emailConfirmado === 'true',
          perfil
        }
      };

      if (perfil === 'aluno') {
        const curso = req.body.curso || undefined;
        const turma = req.body.turma || undefined;

        if (aprovado && (!curso || !turma)) {
          throw falha('Defina o curso e a turma antes de aprovar uma conta de aluno.');
        }

        if (curso || turma) {
          const [cursoValido, turmaValida] = curso && turma
            ? await Promise.all([
              Curso.exists({ _id: curso, ativo: true }),
              Turma.exists({ _id: turma, curso, ativa: true })
            ])
            : [false, false];

          if (!cursoValido || !turmaValida) {
            throw falha('Selecione um curso ativo e uma turma ativa pertencente a ele.');
          }

          alteracao.$set.curso = curso;
          alteracao.$set.turma = turma;
        } else {
          alteracao.$unset = { curso: 1, turma: 1 };
        }
      } else {
        alteracao.$unset = { curso: 1, turma: 1 };
      }

      await Usuario.findByIdAndUpdate(usuario.id, alteracao, { runValidators: true });
      req.flash('sucesso', 'Usuário atualizado.');
      res.redirect('/admin/usuarios');
    };

    this.del = async (req, res) => {
      if (req.params.id === req.session.usuario.id) {
        throw falha('Você não pode excluir sua própria conta administrativa.');
      }

      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) throw falha('Usuário não encontrado.', 404);

      const [tccs, ideias, comentarios, denuncias] = await Promise.all([
        Tcc.countDocuments({
          $or: [{ alunoResponsavel: usuario.id }, { orientador: usuario.id }]
        }),
        Ideia.countDocuments({
          $or: [{ autor: usuario.id }, { responsavelUso: usuario.id }]
        }),
        Comentario.countDocuments({ autor: usuario.id }),
        Denuncia.countDocuments({ denunciante: usuario.id })
      ]);

      if (tccs + ideias + comentarios + denuncias) {
        await Usuario.findByIdAndUpdate(usuario.id, { ativo: false, aprovado: false });
        req.flash(
          'sucesso',
          'O usuário possui conteúdo vinculado e foi desativado para preservar o histórico.'
        );
      } else {
        await usuario.deleteOne();
        req.flash('sucesso', 'Usuário excluído.');
      }

      res.redirect('/admin/usuarios');
    };
  }
}
