import Usuario from '../models/usuario.js';
import Tcc from '../models/tcc.js';
import Ideia from '../models/ideia.js';
import Comentario from '../models/comentario.js';
import Denuncia from '../models/denuncia.js';
import { descricaoUsoIdeia } from '../utils/usoIdeia.js';

function falha(mensagem,status=400){return Object.assign(new Error(mensagem),{status});}

export default class PainelController {
  index = async(req,res) => {
    const usuario=req.session.usuario;
    let dados={};

    if(usuario.perfil==='aluno'){
      dados={};
    }else if(usuario.perfil==='professor'){
      dados={
        aguardandoRevisao:await Tcc.countDocuments({orientador:usuario.id,status:{$in:['Enviado','Reenviado','Aguardando revisão']}}),
        aguardandoLiberacao:await Tcc.countDocuments({orientador:usuario.id,status:'Aprovado'}),
        trabalhosAvaliados:await Tcc.countDocuments({orientador:usuario.id,status:{$in:['Correções solicitadas','Aprovado','Publicado']} }),
        trabalhosOrientados:await Tcc.countDocuments({orientador:usuario.id,status:{$ne:'Rascunho'}}),
        ideiasEmAnalise:await Ideia.countDocuments({status:'Em análise'}),
        denunciasPendentes:await Denuncia.countDocuments({status:'Pendente'})
      };
    }else{
      const downloads=await Tcc.aggregate([{$group:{_id:null,total:{$sum:'$downloads'}}}]);
      dados={
        totalUsuarios:await Usuario.countDocuments(), totalTccs:await Tcc.countDocuments(),
        aguardandoAprovacao:await Tcc.countDocuments({status:{$in:['Enviado','Reenviado','Aguardando revisão']}}),
        aguardandoLiberacao:await Tcc.countDocuments({status:'Aprovado'}), publicados:await Tcc.countDocuments({status:'Publicado'}),
        totalDownloads:downloads[0]?.total||0, totalIdeias:await Ideia.countDocuments(),
        denunciasPendentes:await Denuncia.countDocuments({status:'Pendente'}), comentarios:await Comentario.countDocuments()
      };
    }

    res.render('painel/index',{title:'Meu painel',dados});
  };

  favoritos = async(req,res) => {
    const conta=await Usuario.findById(req.session.usuario.id).select('favoritosTcc favoritosIdeia');
    if(!conta)throw falha('Sua conta não foi encontrada.',404);
    const [tccs,ideias]=await Promise.all([
      Tcc.find({_id:{$in:conta.favoritosTcc},status:'Publicado'}).select('-pdf.dados -capa.dados').populate('curso orientador').sort({titulo:1}),
      Ideia.find({_id:{$in:conta.favoritosIdeia},status:{$ne:'Arquivada'}}).populate('curso autor responsavelUso').sort({titulo:1})
    ]);
    res.render('painel/favoritos',{title:'Meus favoritos',tccs,ideias,descricaoUsoIdeia});
  };

  favoritoTcc = async(req,res) => {
    const [usuario,tcc]=await Promise.all([
      Usuario.findById(req.session.usuario.id),
      Tcc.exists({_id:req.params.id,status:'Publicado'})
    ]);
    if(!usuario)throw falha('Sua conta não foi encontrada.',404);
    if(!tcc)throw falha('Somente TCCs publicados podem ser favoritados.',404);
    const tem=usuario.favoritosTcc.some(id=>String(id)===req.params.id);
    await Usuario.findByIdAndUpdate(usuario.id,tem?{$pull:{favoritosTcc:req.params.id}}:{$addToSet:{favoritosTcc:req.params.id}});
    req.flash('sucesso',tem?'TCC removido dos favoritos.':'TCC salvo nos favoritos.');
    res.redirect(req.get('referer')||'/favoritos');
  };
}
