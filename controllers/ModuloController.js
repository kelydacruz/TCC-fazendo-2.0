// Funcionalidade exclusiva do AcervoTCC: administração dos módulos da trilha de aprendizagem.
import Modulo from '../models/modulo.js';
import Usuario from '../models/usuario.js';

function falha(mensagem, status = 400) {
    return Object.assign(new Error(mensagem), { status });
}

function linhas(valor) {
    return String(valor || '').split('\n').filter(Boolean);
}

export default class ModuloController{
    constructor(caminhoBase='admin/'){
        this.caminhoBase = caminhoBase;

        this.list = async(req, res)=>{
            const modulos = await Modulo.find().sort({ ordem: 1 });
            res.render(this.caminhoBase + 'modulos', {
                title: 'Gerenciar trilha',
                modulos
            });
        };

        this.add = async(req, res)=>{
            await Modulo.create({
                ordem: req.body.ordem,
                titulo: req.body.titulo,
                explicacao: req.body.explicacao,
                exemplo: req.body.exemplo,
                dicas: linhas(req.body.dicas),
                errosComuns: linhas(req.body.errosComuns),
                materialUrl: req.body.materialUrl
            });
            req.flash('sucesso', 'Módulo criado.');
            res.redirect('/admin/modulos');
        };

        this.edt = async(req, res)=>{
            await Modulo.findByIdAndUpdate(
                req.params.id,
                {
                    ordem: req.body.ordem,
                    titulo: req.body.titulo,
                    explicacao: req.body.explicacao,
                    exemplo: req.body.exemplo,
                    dicas: linhas(req.body.dicas),
                    errosComuns: linhas(req.body.errosComuns),
                    materialUrl: req.body.materialUrl,
                    publicado: req.body.publicado === 'true'
                },
                { runValidators: true }
            );
            req.flash('sucesso', 'Módulo atualizado.');
            res.redirect('/admin/modulos');
        };

        this.del = async(req, res)=>{
            const modulo = await Modulo.findById(req.params.id);
            if (!modulo) throw falha('Módulo não encontrado.', 404);

            await Usuario.updateMany({}, { $pull: { progressoModulos: modulo.id } });
            await modulo.deleteOne();
            req.flash('sucesso', 'Módulo excluído da trilha.');
            res.redirect('/admin/modulos');
        };
    }
}
