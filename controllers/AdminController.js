import Usuario from '../models/usuario.js';
import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Modulo from '../models/modulo.js';
import Tcc from '../models/tcc.js';
import Ideia from '../models/ideia.js';
import Comentario from '../models/comentario.js';
import Denuncia from '../models/denuncia.js';
import Configuracao from '../models/configuracao.js';

function falha(mensagem,status=400){return Object.assign(new Error(mensagem),{status});}

export default class AdminController {
  usuarios = async(req,res)=>{
    const [usuarios,cursos,turmas]=await Promise.all([Usuario.find().populate('curso turma').sort({aprovado:1,createdAt:-1}),Curso.find({ativo:true}).sort({nome:1}),Turma.find({ativa:true}).populate('curso').sort({ano:-1,nome:1})]);
    res.render('admin/usuarios',{title:'Gerenciar usuários',usuarios,cursos,turmas});
  };

  usuario = async(req,res)=>{
    const usuario=await Usuario.findById(req.params.id);
    if(!usuario)throw falha('Usuário não encontrado.',404);
    const perfil=['aluno','professor','administrador'].includes(req.body.perfil)?req.body.perfil:usuario.perfil;
    const aprovado=req.body.aprovado==='true';
    if(usuario.id===req.session.usuario.id&&(perfil!=='administrador'||!aprovado||req.body.ativo!=='true'))throw falha('Sua própria conta deve permanecer como administrador ativo e aprovado.');
    const alteracao={$set:{aprovado,ativo:req.body.ativo==='true',emailConfirmado:req.body.emailConfirmado==='true',perfil}};
    if(perfil==='aluno'){
      const curso=req.body.curso||undefined;const turma=req.body.turma||undefined;
      if(aprovado&&(!curso||!turma))throw falha('Defina o curso e a turma antes de aprovar uma conta de aluno.');
      if(curso||turma){
        const [cursoValido,turmaValida]=curso&&turma?await Promise.all([Curso.exists({_id:curso,ativo:true}),Turma.exists({_id:turma,curso,ativa:true})]):[false,false];
        if(!cursoValido||!turmaValida)throw falha('Selecione um curso ativo e uma turma ativa pertencente a ele.');
        alteracao.$set.curso=curso;alteracao.$set.turma=turma;
      }else alteracao.$unset={curso:1,turma:1};
    }else alteracao.$unset={curso:1,turma:1};
    await Usuario.findByIdAndUpdate(usuario.id,alteracao,{runValidators:true});
    req.flash('sucesso','Usuário atualizado.');res.redirect('/admin/usuarios');
  };

  delUsuario = async(req,res)=>{
    if(req.params.id===req.session.usuario.id)throw falha('Você não pode excluir sua própria conta administrativa.');
    const usuario=await Usuario.findById(req.params.id);if(!usuario)throw falha('Usuário não encontrado.',404);
    const [tccs,ideias,comentarios,denuncias]=await Promise.all([Tcc.countDocuments({$or:[{alunoResponsavel:usuario.id},{orientador:usuario.id}]}),Ideia.countDocuments({$or:[{autor:usuario.id},{responsavelUso:usuario.id}]}),Comentario.countDocuments({autor:usuario.id}),Denuncia.countDocuments({denunciante:usuario.id})]);
    if(tccs+ideias+comentarios+denuncias){await Usuario.findByIdAndUpdate(usuario.id,{ativo:false,aprovado:false});req.flash('sucesso','O usuário possui conteúdo vinculado e foi desativado para preservar o histórico.');}
    else{await usuario.deleteOne();req.flash('sucesso','Usuário excluído.');}
    res.redirect('/admin/usuarios');
  };

  cursos = async(req,res)=>res.render('admin/cursos',{title:'Cursos e turmas',cursos:await Curso.find().sort({ativo:-1,nome:1}),turmas:await Turma.find().populate('curso').sort({ativa:-1,ano:-1,nome:1})});
  addCurso = async(req,res)=>{await Curso.create({nome:req.body.nome,sigla:req.body.sigla,descricao:req.body.descricao});req.flash('sucesso','Curso criado.');res.redirect('/admin/cursos');};
  edtCurso = async(req,res)=>{await Curso.findByIdAndUpdate(req.params.id,{nome:req.body.nome,sigla:req.body.sigla,descricao:req.body.descricao,ativo:req.body.ativo==='true'},{runValidators:true});req.flash('sucesso','Curso atualizado.');res.redirect('/admin/cursos');};
  delCurso = async(req,res)=>{
    const curso=await Curso.findById(req.params.id);if(!curso)throw falha('Curso não encontrado.',404);
    const [turmas,tccs,ideias,alunos]=await Promise.all([Turma.countDocuments({curso:curso.id}),Tcc.countDocuments({curso:curso.id}),Ideia.countDocuments({curso:curso.id}),Usuario.countDocuments({curso:curso.id})]);
    if(turmas+tccs+ideias+alunos){curso.ativo=false;await curso.save();req.flash('sucesso','O curso possui vínculos e foi desativado. Remova os vínculos antes de excluí-lo definitivamente.');}
    else{await curso.deleteOne();req.flash('sucesso','Curso excluído.');}
    res.redirect('/admin/cursos');
  };

  addTurma = async(req,res)=>{if(!await Curso.exists({_id:req.body.curso,ativo:true}))throw falha('Selecione um curso ativo.');await Turma.create({nome:req.body.nome,curso:req.body.curso,ano:req.body.ano});req.flash('sucesso','Turma criada.');res.redirect('/admin/cursos');};
  edtTurma = async(req,res)=>{const turma=await Turma.findById(req.params.id);if(!turma)throw falha('Turma não encontrada.',404);if(String(turma.curso)!==String(req.body.curso)){const [tccs,alunos]=await Promise.all([Tcc.countDocuments({turma:turma.id}),Usuario.countDocuments({turma:turma.id})]);if(tccs+alunos)throw falha('Não é possível trocar o curso de uma turma que já possui alunos ou TCCs vinculados.');}Object.assign(turma,{nome:req.body.nome,curso:req.body.curso,ano:req.body.ano,ativa:req.body.ativa==='true'});await turma.save();req.flash('sucesso','Turma atualizada.');res.redirect('/admin/cursos');};
  delTurma = async(req,res)=>{
    const turma=await Turma.findById(req.params.id);if(!turma)throw falha('Turma não encontrada.',404);
    const [tccs,alunos]=await Promise.all([Tcc.countDocuments({turma:turma.id}),Usuario.countDocuments({turma:turma.id})]);
    if(tccs+alunos){turma.ativa=false;await turma.save();req.flash('sucesso','A turma possui vínculos e foi desativada para preservar os registros.');}
    else{await turma.deleteOne();req.flash('sucesso','Turma excluída.');}
    res.redirect('/admin/cursos');
  };

  modulos = async(req,res)=>res.render('admin/modulos',{title:'Gerenciar trilha',modulos:await Modulo.find().sort({ordem:1})});
  addModulo = async(req,res)=>{await Modulo.create({ordem:req.body.ordem,titulo:req.body.titulo,explicacao:req.body.explicacao,exemplo:req.body.exemplo,dicas:String(req.body.dicas||'').split('\n').filter(Boolean),errosComuns:String(req.body.errosComuns||'').split('\n').filter(Boolean),materialUrl:req.body.materialUrl});req.flash('sucesso','Módulo criado.');res.redirect('/admin/modulos');};
  edtModulo = async(req,res)=>{await Modulo.findByIdAndUpdate(req.params.id,{ordem:req.body.ordem,titulo:req.body.titulo,explicacao:req.body.explicacao,exemplo:req.body.exemplo,dicas:String(req.body.dicas||'').split('\n').filter(Boolean),errosComuns:String(req.body.errosComuns||'').split('\n').filter(Boolean),materialUrl:req.body.materialUrl,publicado:req.body.publicado==='true'},{runValidators:true});req.flash('sucesso','Módulo atualizado.');res.redirect('/admin/modulos');};
  delModulo = async(req,res)=>{const modulo=await Modulo.findById(req.params.id);if(!modulo)throw falha('Módulo não encontrado.',404);await Usuario.updateMany({},{$pull:{progressoModulos:modulo.id}});await modulo.deleteOne();req.flash('sucesso','Módulo excluído da trilha.');res.redirect('/admin/modulos');};

  denuncias = async(req,res)=>res.render('admin/denuncias',{title:'Denúncias',denuncias:await Denuncia.find().populate({path:'comentario',populate:{path:'autor ideia'}}).populate('denunciante').sort({createdAt:-1})});
  denuncia = async(req,res)=>{await Denuncia.findByIdAndUpdate(req.params.id,{status:req.body.status},{runValidators:true});req.flash('sucesso','Denúncia atualizada.');res.redirect('/admin/denuncias');};
  delDenuncia = async(req,res)=>{await Denuncia.findByIdAndDelete(req.params.id);req.flash('sucesso','Denúncia excluída.');res.redirect('/admin/denuncias');};

  configuracao = async(req,res)=>res.render('admin/configuracao',{title:'Configurações',config:await Configuracao.findOneAndUpdate({chave:'geral'},{$setOnInsert:{chave:'geral'}},{upsert:true,new:true})});
  salvarConfiguracao = async(req,res)=>{await Configuracao.findOneAndUpdate({chave:'geral'},{instituicao:req.body.instituicao,contato:req.body.contato,endereco:req.body.endereco,privacidade:req.body.privacidade,permitirCadastro:req.body.permitirCadastro==='true',permitirDownloads:req.body.permitirDownloads==='true'},{upsert:true,runValidators:true});req.flash('sucesso','Configurações atualizadas.');res.redirect('/admin/configuracao');};
}
