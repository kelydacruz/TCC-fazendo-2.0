// Funcionalidade exclusiva do AcervoTCC: trilha de aprendizagem com progresso individual.
import Modulo from '../models/modulo.js';
import Usuario from '../models/usuario.js';

export default class AprendizagemController{
    constructor(caminhoBase='modulo/'){
        this.caminhoBase = caminhoBase;

        this.list = async(req, res)=>{
            const modulos = await Modulo.find({ publicado: true }).sort({ ordem: 1 });
            let concluidos = [];

            if (req.session.usuario) {
                const usuario = await Usuario.findById(req.session.usuario.id)
                    .select('progressoModulos');
                concluidos = usuario?.progressoModulos.map(String) || [];
            }

            res.render('aprender-db', {
                title: 'Aprenda a fazer seu TCC',
                modulos,
                concluidos
            });
        };

        this.detalhes = async(req, res)=>{
            const modulo = await Modulo.findOne({
                _id: req.params.id,
                publicado: true
            });

            if (!modulo) {
                return res.status(404).render('404', { title: 'Módulo não encontrado' });
            }

            let concluido = false;
            if (req.session.usuario) {
                const usuario = await Usuario.findById(req.session.usuario.id)
                    .select('progressoModulos');
                concluido = usuario?.progressoModulos.some(id => String(id) === modulo.id);
            }

            return res.render(this.caminhoBase + 'detalhes', {
                title: modulo.titulo,
                modulo,
                concluido
            });
        };

        this.progresso = async(req, res)=>{
            const usuario = await Usuario.findById(req.session.usuario.id);
            const tem = usuario.progressoModulos.some(id => String(id) === req.params.id);
            const alteracao = tem
                ? { $pull: { progressoModulos: req.params.id } }
                : { $addToSet: { progressoModulos: req.params.id } };

            await Usuario.findByIdAndUpdate(usuario.id, alteracao);
            req.flash(
                'sucesso',
                tem ? 'Módulo marcado como pendente.' : 'Módulo concluído.'
            );
            res.redirect('/aprender/' + req.params.id);
        };
    }
}
