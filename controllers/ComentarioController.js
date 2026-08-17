// Funcionalidade exclusiva do AcervoTCC: comentários, denúncias e moderação do Banco de Ideias.
import Comentario from '../models/comentario.js';
import Denuncia from '../models/denuncia.js';
import { ehDono, podeModerar } from '../utils/texto.js';

export default class ComentarioController{
    constructor(caminhoBase='ideias/'){
        this.caminhoBase = caminhoBase;

        this.add = async(req, res)=>{
            const texto = String(req.body.texto || '').trim();
            if (texto.length < 2) {
                throw new Error('Escreva um comentário antes de publicar.');
            }

            // Funcionalidade exclusiva do AcervoTCC: prevenção básica contra spam repetido.
            const recente = await Comentario.exists({
                autor: req.session.usuario.id,
                createdAt: { $gt: new Date(Date.now() - 15000) }
            });
            if (recente) {
                throw new Error('Aguarde alguns segundos antes de comentar novamente.');
            }

            await Comentario.create({
                ideia: req.params.ideiaId,
                autor: req.session.usuario.id,
                texto
            });
            req.flash('sucesso', 'Comentário publicado.');
            res.redirect('/' + this.caminhoBase + req.params.ideiaId + '#comentarios');
        };

        this.del = async(req, res)=>{
            const comentario = await Comentario.findById(req.params.id);
            const podeExcluir = comentario && (
                ehDono(comentario.autor, req.session.usuario)
                || podeModerar(req.session.usuario)
            );

            if (!podeExcluir) {
                throw Object.assign(new Error('Acesso negado.'), { status: 403 });
            }

            const ideiaId = comentario.ideia;
            await comentario.deleteOne();
            req.flash('sucesso', 'Comentário excluído.');
            res.redirect('/' + this.caminhoBase + ideiaId + '#comentarios');
        };

        this.denunciar = async(req, res)=>{
            await Denuncia.create({
                comentario: req.params.id,
                denunciante: req.session.usuario.id,
                motivo: req.body.motivo
            });
            req.flash('sucesso', 'Denúncia enviada para análise.');
            res.redirect(req.get('referer') || '/ideias');
        };

        this.moderar = async(req, res)=>{
            const comentario = await Comentario.findByIdAndUpdate(
                req.params.id,
                { oculto: req.body.acao === 'ocultar' },
                { new: true }
            );
            if (!comentario) throw new Error('Comentário não encontrado.');

            req.flash('sucesso', 'Moderação registrada.');
            res.redirect(req.get('referer') || '/painel');
        };
    }
}
