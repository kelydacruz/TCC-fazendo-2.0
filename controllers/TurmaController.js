import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Tcc from '../models/tcc.js';
import Usuario from '../models/usuario.js';

function falha(mensagem, status = 400) {
  return Object.assign(new Error(mensagem), { status });
}

export default class TurmaController {
  constructor(caminhoBase = 'admin/') {
    this.caminhoBase = caminhoBase;

    this.add = async (req, res) => {
      const cursoExiste = await Curso.exists({ _id: req.body.curso, ativo: true });
      if (!cursoExiste) throw falha('Selecione um curso ativo.');

      await Turma.create({
        nome: req.body.nome,
        curso: req.body.curso,
        ano: req.body.ano
      });
      req.flash('sucesso', 'Turma criada.');
      res.redirect('/admin/cursos');
    };

    this.edt = async (req, res) => {
      const turma = await Turma.findById(req.params.id);
      if (!turma) throw falha('Turma não encontrada.', 404);

      if (String(turma.curso) !== String(req.body.curso)) {
        const [tccs, alunos] = await Promise.all([
          Tcc.countDocuments({ turma: turma.id }),
          Usuario.countDocuments({ turma: turma.id })
        ]);

        if (tccs + alunos) {
          throw falha(
            'Não é possível trocar o curso de uma turma que já possui alunos ou TCCs vinculados.'
          );
        }
      }

      Object.assign(turma, {
        nome: req.body.nome,
        curso: req.body.curso,
        ano: req.body.ano,
        ativa: req.body.ativa === 'true'
      });
      await turma.save();
      req.flash('sucesso', 'Turma atualizada.');
      res.redirect('/admin/cursos');
    };

    this.del = async (req, res) => {
      const turma = await Turma.findById(req.params.id);
      if (!turma) throw falha('Turma não encontrada.', 404);

      const [tccs, alunos] = await Promise.all([
        Tcc.countDocuments({ turma: turma.id }),
        Usuario.countDocuments({ turma: turma.id })
      ]);

      if (tccs + alunos) {
        turma.ativa = false;
        await turma.save();
        req.flash(
          'sucesso',
          'A turma possui vínculos e foi desativada para preservar os registros.'
        );
      } else {
        await turma.deleteOne();
        req.flash('sucesso', 'Turma excluída.');
      }

      res.redirect('/admin/cursos');
    };
  }
}
