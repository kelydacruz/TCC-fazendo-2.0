import Ideia, { STATUS_IDEIA } from '../models/ideia.js';
import Comentario from '../models/comentario.js';
import Curso from '../models/curso.js';
import Tcc from '../models/tcc.js';
import Usuario from '../models/usuario.js';
import { ehDono, lista, podeModerar, regexSegura } from '../utils/texto.js';
import { bancoDisponivel } from '../config/conexao.js';
import { dadosDeUsoIdeia, descricaoUsoIdeia, STATUS_IDEIA_COM_RESPONSAVEL } from '../utils/usoIdeia.js';

export default class IdeiaController {
  constructor(caminhoBase='ideia/'){ this.caminhoBase=caminhoBase; }
  list = async (req,res) => {
    if(!bancoDisponivel())return res.render(this.caminhoBase+'lst',{title:'Banco de Ideias',ideias:[],cursos:[],areas:[],statusIdeia:STATUS_IDEIA,query:req.query,descricaoUsoIdeia});
    const {q='',curso='',area='',dificuldade='',status='',dataInicio='',dataFim='',ordem='recentes'}=req.query;
    const filtro={};
    if(q){const busca=new RegExp(regexSegura(q),'i');filtro.$or=[{titulo:busca},{descricao:busca},{problema:busca}];}
    if(curso)filtro.curso=curso;
    if(area)filtro.area=area;
    if(dificuldade)filtro.dificuldade=dificuldade;
    if(status)filtro.status=status;
    if(dataInicio||dataFim){
      filtro.createdAt={};
      if(dataInicio){const inicio=new Date(`${dataInicio}T00:00:00`);if(!Number.isNaN(inicio.getTime()))filtro.createdAt.$gte=inicio;}
      if(dataFim){const fim=new Date(`${dataFim}T23:59:59.999`);if(!Number.isNaN(fim.getTime()))filtro.createdAt.$lte=fim;}
      if(!Object.keys(filtro.createdAt).length)delete filtro.createdAt;
    }
    const ideias=await Ideia.find(filtro).populate('curso autor responsavelUso tccVinculado').sort(ordem==='antigas'?{createdAt:1}:{createdAt:-1});
    const [cursos,areas]=await Promise.all([Curso.find({ativo:true}).sort({nome:1}),Ideia.distinct('area')]);
    res.render(this.caminhoBase+'lst',{title:'Banco de Ideias',ideias,cursos,areas:areas.sort(),statusIdeia:STATUS_IDEIA,query:req.query,descricaoUsoIdeia});
  };
  detalhes = async (req,res) => { if(!bancoDisponivel())return res.status(404).render('404',{title:'Ideia não encontrada'});const ideia=await Ideia.findById(req.params.id).populate('curso autor responsavelUso tccVinculado'); if(!ideia)return res.status(404).render('404',{title:'Ideia não encontrada'}); const [comentarios,favorito]=await Promise.all([Comentario.find({ideia:ideia.id,oculto:false}).populate('autor').sort({createdAt:1}),req.session.usuario?Usuario.exists({_id:req.session.usuario.id,favoritosIdeia:ideia.id}):false]); res.render(this.caminhoBase+'detalhes',{title:ideia.titulo,ideia,comentarios,favorito:Boolean(favorito),descricaoUso:descricaoUsoIdeia(ideia)}); };
  openAdd = async(req,res)=>res.render(this.caminhoBase+'add',{title:'Publicar ideia',cursos:await Curso.find({ativo:true})});
  add = async(req,res)=>{const ideia=await Ideia.create({titulo:req.body.titulo,descricao:req.body.descricao,problema:req.body.problema,curso:req.body.curso,area:req.body.area,dificuldade:req.body.dificuldade,conhecimentos:lista(req.body.conhecimentos),autor:req.session.usuario.id});req.flash('sucesso','Ideia publicada.');res.redirect('/ideias/'+ideia.id);};
  openEdt = async(req,res)=>{const ideia=await Ideia.findById(req.params.id);if(!ideia||(!ehDono(ideia.autor,req.session.usuario)&&!podeModerar(req.session.usuario)))throw Object.assign(new Error('Acesso negado.'),{status:403});const [cursos,tccs,usuariosUso]=await Promise.all([Curso.find({ativo:true}),Tcc.find({status:'Publicado'}).select('titulo'),Usuario.find({perfil:{$in:['aluno','professor']},aprovado:true,ativo:true}).sort({nome:1}).select('nome perfil')]);res.render(this.caminhoBase+'edt',{title:'Editar ideia',ideia,cursos,tccs,usuariosUso,statusIdeia:STATUS_IDEIA});};
  edt = async(req,res)=>{const ideia=await Ideia.findById(req.params.id);if(!ideia)throw new Error('Ideia não encontrada.');const moderador=podeModerar(req.session.usuario);if(!moderador&&(!ehDono(ideia.autor,req.session.usuario)||ideia.status!=='Disponível'))throw Object.assign(new Error('Esta ideia não pode ser editada.'),{status:403});Object.assign(ideia,{titulo:req.body.titulo,descricao:req.body.descricao,problema:req.body.problema,curso:req.body.curso,area:req.body.area,dificuldade:req.body.dificuldade,conhecimentos:lista(req.body.conhecimentos)});if(moderador&&STATUS_IDEIA.includes(req.body.status)){if(STATUS_IDEIA_COM_RESPONSAVEL.includes(req.body.status)&&!req.body.responsavelUso)throw new Error('Informe o usuário responsável para este status.');if(req.body.responsavelUso&&!await Usuario.exists({_id:req.body.responsavelUso,perfil:{$in:['aluno','professor']},aprovado:true,ativo:true}))throw new Error('Selecione um usuário ativo e aprovado.');if(req.body.tccVinculado&&!await Tcc.exists({_id:req.body.tccVinculado,status:'Publicado'}))throw new Error('Selecione um TCC publicado válido.');const uso=dadosDeUsoIdeia(req.body.status,req.body.responsavelUso,req.body.tccVinculado);ideia.status=req.body.status;ideia.responsavelUso=uso.responsavelUso;ideia.tccVinculado=uso.tccVinculado;ideia.moderada=true;}await ideia.save();req.flash('sucesso','Ideia atualizada.');res.redirect('/ideias/'+ideia.id);};
  del = async(req,res)=>{const ideia=await Ideia.findById(req.params.id);if(!ideia||(!ehDono(ideia.autor,req.session.usuario)&&req.session.usuario.perfil!=='administrador'))throw Object.assign(new Error('Acesso negado.'),{status:403});if(req.session.usuario.perfil!=='administrador'&&ideia.status!=='Disponível')throw new Error('Somente ideias disponíveis podem ser excluídas.');await Promise.all([Comentario.deleteMany({ideia:ideia.id}),Usuario.updateMany({},{$pull:{favoritosIdeia:ideia.id}})]);await ideia.deleteOne();req.flash('sucesso','Ideia excluída.');res.redirect('/ideias');};
  favorito = async(req,res)=>{const [usuario,ideia]=await Promise.all([Usuario.findById(req.session.usuario.id),Ideia.exists({_id:req.params.id,status:{$ne:'Arquivada'}})]);if(!usuario)throw Object.assign(new Error('Sua conta não foi encontrada.'),{status:404});if(!ideia)throw Object.assign(new Error('Esta ideia não está disponível para favoritos.'),{status:404});const tem=usuario.favoritosIdeia.some(id=>String(id)===req.params.id);await Usuario.findByIdAndUpdate(usuario.id,tem?{$pull:{favoritosIdeia:req.params.id}}:{$addToSet:{favoritosIdeia:req.params.id}});req.flash('sucesso',tem?'Ideia removida dos favoritos.':'Ideia salva nos favoritos.');res.redirect(req.get('referer')||'/favoritos');};
}
