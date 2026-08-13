import Configuracao from '../models/configuracao.js';

export default class ConfiguracaoController {
  constructor(caminhoBase = 'admin/') {
    this.caminhoBase = caminhoBase;

    this.openEdt = async (req, res) => {
      const config = await Configuracao.findOneAndUpdate(
        { chave: 'geral' },
        { $setOnInsert: { chave: 'geral' } },
        { upsert: true, new: true }
      );

      res.render(this.caminhoBase + 'configuracao', {
        title: 'Configurações',
        config
      });
    };

    this.edt = async (req, res) => {
      await Configuracao.findOneAndUpdate(
        { chave: 'geral' },
        {
          instituicao: req.body.instituicao,
          contato: req.body.contato,
          endereco: req.body.endereco,
          privacidade: req.body.privacidade,
          permitirCadastro: req.body.permitirCadastro === 'true',
          permitirDownloads: req.body.permitirDownloads === 'true'
        },
        { upsert: true, runValidators: true }
      );
      req.flash('sucesso', 'Configurações atualizadas.');
      res.redirect('/admin/configuracao');
    };
  }
}
