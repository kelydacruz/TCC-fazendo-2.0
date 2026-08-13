import Denuncia from '../models/denuncia.js';

export default class DenunciaController {
  constructor(caminhoBase = 'admin/') {
    this.caminhoBase = caminhoBase;

    this.list = async (req, res) => {
      const denuncias = await Denuncia.find()
        .populate({ path: 'comentario', populate: { path: 'autor ideia' } })
        .populate('denunciante')
        .sort({ createdAt: -1 });

      res.render(this.caminhoBase + 'denuncias', {
        title: 'Denúncias',
        denuncias
      });
    };

    this.edt = async (req, res) => {
      await Denuncia.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { runValidators: true }
      );
      req.flash('sucesso', 'Denúncia atualizada.');
      res.redirect('/admin/denuncias');
    };

    this.del = async (req, res) => {
      await Denuncia.findByIdAndDelete(req.params.id);
      req.flash('sucesso', 'Denúncia excluída.');
      res.redirect('/admin/denuncias');
    };
  }
}
