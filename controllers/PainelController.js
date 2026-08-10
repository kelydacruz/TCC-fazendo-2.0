import Usuario from '../models/usuario.js';
import Tcc from '../models/tcc.js';
import Ideia from '../models/ideia.js';
import Comentario from '../models/comentario.js';
import Denuncia from '../models/denuncia.js';

export default class PainelController {
  index = async(req,res)=>{const usuario=req.session.usuario;let dados={};if(usuario.perfil==='aluno'){dados={tccs:await Tcc.countDocuments({alunoResponsavel:usuario.id}),ideias:await Ideia.countDocuments({autor:usuario.id}),conta:await Usuario.findById(usuario.id).populate('favoritosTcc favoritosIdeia progressoModulos')};}else if(usuario.perfil==='professor'){dados={pendentes:await Tcc.countDocuments({orientador:usuario.id,status:{$in:['Enviado','Reenviado','Aguardando revisão']}}),orientados:await Tcc.countDocuments({orientador:usuario.id}),ideias:await Ideia.countDocuments({autor:usuario.id})};}else{dados={usuariosPendentes:await Usuario.countDocuments({aprovado:false}),tccs:await Tcc.countDocuments(),publicados:await Tcc.countDocuments({status:'Publicado'}),ideias:await Ideia.countDocuments(),denuncias:await Denuncia.countDocuments({status:'Pendente'}),comentarios:await Comentario.countDocuments()};}res.render('painel/index',{title:'Meu painel',dados});};
  favoritoTcc = async(req,res)=>{const usuario=await Usuario.findById(req.session.usuario.id);const tem=usuario.favoritosTcc.some(id=>String(id)===req.params.id);await Usuario.findByIdAndUpdate(usuario.id,tem?{$pull:{favoritosTcc:req.params.id}}:{$addToSet:{favoritosTcc:req.params.id}});req.flash('sucesso',tem?'TCC removido dos favoritos.':'TCC salvo nos favoritos.');res.redirect(req.get('referer')||'/tccs/'+req.params.id);};
}
