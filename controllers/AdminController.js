import Usuario from '../models/usuario.js';
import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Modulo from '../models/modulo.js';
import Denuncia from '../models/denuncia.js';
import Configuracao from '../models/configuracao.js';

export default class AdminController {
  usuarios = async(req,res)=>res.render('admin/usuarios',{title:'Gerenciar usuários',usuarios:await Usuario.find().sort({aprovado:1,createdAt:-1})});
  usuario = async(req,res)=>{const usuario=await Usuario.findById(req.params.id);if(!usuario)throw new Error('Usuário não encontrado.');const perfil=['aluno','professor','administrador'].includes(req.body.perfil)?req.body.perfil:usuario.perfil;await Usuario.findByIdAndUpdate(usuario.id,{aprovado:req.body.aprovado==='true',ativo:req.body.ativo==='true',emailConfirmado:req.body.emailConfirmado==='true',perfil});req.flash('sucesso','Usuário atualizado.');res.redirect('/admin/usuarios');};
  cursos = async(req,res)=>res.render('admin/cursos',{title:'Cursos e turmas',cursos:await Curso.find().sort({nome:1}),turmas:await Turma.find().populate('curso').sort({ano:-1,nome:1})});
  addCurso = async(req,res)=>{await Curso.create({nome:req.body.nome,sigla:req.body.sigla,descricao:req.body.descricao});req.flash('sucesso','Curso criado.');res.redirect('/admin/cursos');};
  edtCurso = async(req,res)=>{await Curso.findByIdAndUpdate(req.params.id,{nome:req.body.nome,sigla:req.body.sigla,descricao:req.body.descricao,ativo:req.body.ativo==='true'},{runValidators:true});req.flash('sucesso','Curso atualizado.');res.redirect('/admin/cursos');};
  addTurma = async(req,res)=>{await Turma.create({nome:req.body.nome,curso:req.body.curso,ano:req.body.ano});req.flash('sucesso','Turma criada.');res.redirect('/admin/cursos');};
  edtTurma = async(req,res)=>{await Turma.findByIdAndUpdate(req.params.id,{nome:req.body.nome,curso:req.body.curso,ano:req.body.ano,ativa:req.body.ativa==='true'},{runValidators:true});req.flash('sucesso','Turma atualizada.');res.redirect('/admin/cursos');};
  modulos = async(req,res)=>res.render('admin/modulos',{title:'Gerenciar trilha',modulos:await Modulo.find().sort({ordem:1})});
  addModulo = async(req,res)=>{await Modulo.create({ordem:req.body.ordem,titulo:req.body.titulo,explicacao:req.body.explicacao,exemplo:req.body.exemplo,dicas:String(req.body.dicas||'').split('\n').filter(Boolean),errosComuns:String(req.body.errosComuns||'').split('\n').filter(Boolean),materialUrl:req.body.materialUrl});req.flash('sucesso','Módulo criado.');res.redirect('/admin/modulos');};
  edtModulo = async(req,res)=>{await Modulo.findByIdAndUpdate(req.params.id,{ordem:req.body.ordem,titulo:req.body.titulo,explicacao:req.body.explicacao,exemplo:req.body.exemplo,dicas:String(req.body.dicas||'').split('\n').filter(Boolean),errosComuns:String(req.body.errosComuns||'').split('\n').filter(Boolean),materialUrl:req.body.materialUrl,publicado:req.body.publicado==='true'},{runValidators:true});req.flash('sucesso','Módulo atualizado.');res.redirect('/admin/modulos');};
  denuncias = async(req,res)=>res.render('admin/denuncias',{title:'Denúncias',denuncias:await Denuncia.find().populate({path:'comentario',populate:{path:'autor ideia'}}).populate('denunciante').sort({createdAt:-1})});
  denuncia = async(req,res)=>{await Denuncia.findByIdAndUpdate(req.params.id,{status:req.body.status});req.flash('sucesso','Denúncia atualizada.');res.redirect('/admin/denuncias');};
  configuracao = async(req,res)=>res.render('admin/configuracao',{title:'Configurações',config:await Configuracao.findOneAndUpdate({chave:'geral'},{$setOnInsert:{chave:'geral'}},{upsert:true,new:true})});
  salvarConfiguracao = async(req,res)=>{await Configuracao.findOneAndUpdate({chave:'geral'},{instituicao:req.body.instituicao,contato:req.body.contato,endereco:req.body.endereco,privacidade:req.body.privacidade,permitirCadastro:req.body.permitirCadastro==='true',permitirDownloads:req.body.permitirDownloads==='true'},{upsert:true,runValidators:true});req.flash('sucesso','Configurações atualizadas.');res.redirect('/admin/configuracao');};
}
