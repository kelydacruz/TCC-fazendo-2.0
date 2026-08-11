import Tcc, { STATUS_TCC } from '../models/tcc.js';
import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Usuario from '../models/usuario.js';
import { ehDono, lista, regexSegura } from '../utils/texto.js';
import Configuracao from '../models/configuracao.js';
import { acoesAvaliacao, descricaoStatus, validarTransicao } from '../utils/fluxoTcc.js';

export default class TccController {
  constructor(caminhoBase = 'tcc/') { this.caminhoBase = caminhoBase; }

  openAdd = async (req, res) => {
    const [cursos, turmas, professores] = await Promise.all([Curso.find({ ativo:true }), Turma.find({ ativa:true }).populate('curso'), Usuario.find({ perfil:'professor', aprovado:true, ativo:true })]);
    res.render(this.caminhoBase + 'add', { title:'Enviar TCC', cursos, turmas, professores, tcc:null });
  };

  add = async (req, res) => {
    const pdf = req.files?.pdf?.[0];
    const capa = req.files?.capa?.[0];
    const status = req.body.acao === 'enviar' ? 'Enviado' : 'Rascunho';
    if (!lista(req.body.autores).length) throw new Error('Informe pelo menos um autor.');
    if (status === 'Enviado' && !pdf) throw new Error('Anexe o PDF antes de enviar para avaliação.');
    if (status === 'Enviado' && req.body.termoAutorizacao !== 'true') throw new Error('Aceite o termo de autorização antes de enviar o TCC.');
    if (pdf && pdf.buffer.subarray(0,5).toString() !== '%PDF-') throw new Error('O arquivo enviado não é um PDF válido.');
    const tcc = await Tcc.create({
      titulo:req.body.titulo, resumo:req.body.resumo, palavrasChave:lista(req.body.palavrasChave), autores:lista(req.body.autores),
      alunoResponsavel:req.session.usuario.id, orientador:req.body.orientador, curso:req.body.curso, turma:req.body.turma,
      ano:req.body.ano, area:req.body.area, status, ocultarAutores:req.body.ocultarAutores === 'true',
      termoAutorizacao:{ aceito:req.body.termoAutorizacao === 'true', aceitoEm:req.body.termoAutorizacao === 'true' ? new Date() : undefined },
      pdf:pdf ? { dados:pdf.buffer, nome:pdf.originalname, mime:pdf.mimetype, tamanho:pdf.size } : undefined,
      capa:capa ? { dados:capa.buffer, mime:capa.mimetype } : undefined,
      historico:[{ status, observacao:status === 'Enviado' ? 'Versão final enviada ao professor orientador.' : 'Rascunho criado.', usuario:req.session.usuario.id }]
    });
    req.flash('sucesso', status === 'Enviado' ? 'TCC enviado para avaliação.' : 'Rascunho salvo.');
    res.redirect('/tcc/edt/' + tcc.id);
  };

  list = async (req, res) => {
    const usuario = req.session.usuario;
    const filtro = usuario.perfil === 'administrador' ? {} : usuario.perfil === 'professor' ? { orientador:usuario.id } : { alunoResponsavel:usuario.id };
    const tccs = await Tcc.find(filtro).populate('curso turma orientador alunoResponsavel').sort({ updatedAt:-1 });
    res.render(this.caminhoBase + 'lst', { title:'Meus TCCs', tccs });
  };

  openEdt = async (req, res) => {
    const tcc = await Tcc.findById(req.params.id).populate('historico.usuario liberadoPor');
    if (!tcc) throw new Error('TCC não encontrado.');
    const usuario = req.session.usuario;
    const acessoProfessor = usuario.perfil === 'professor' && ehDono(tcc.orientador, usuario);
    const acessoAdmin = usuario.perfil === 'administrador';
    if (!ehDono(tcc.alunoResponsavel, usuario) && !acessoProfessor && !acessoAdmin) throw Object.assign(new Error('Acesso negado.'), { status:403 });
    const [cursos, turmas, professores] = await Promise.all([Curso.find({ ativo:true }), Turma.find({ ativa:true }).populate('curso'), Usuario.find({ perfil:'professor', aprovado:true, ativo:true })]);
    res.render(this.caminhoBase + 'edt', { title:'Editar TCC', tcc, cursos, turmas, professores, editavel:ehDono(tcc.alunoResponsavel, usuario) && ['Rascunho','Correções solicitadas'].includes(tcc.status), acoesAvaliacao:acoesAvaliacao(tcc.status,usuario.perfil), descricaoStatus:descricaoStatus(tcc.status) });
  };

  edt = async (req, res) => {
    const tcc = await Tcc.findById(req.params.id);
    if (!tcc || !ehDono(tcc.alunoResponsavel, req.session.usuario) || !['Rascunho','Correções solicitadas'].includes(tcc.status)) throw Object.assign(new Error('Este trabalho não pode ser editado.'), { status:403 });
    Object.assign(tcc, { titulo:req.body.titulo, resumo:req.body.resumo, palavrasChave:lista(req.body.palavrasChave), autores:lista(req.body.autores), orientador:req.body.orientador, curso:req.body.curso, turma:req.body.turma, ano:req.body.ano, area:req.body.area, ocultarAutores:req.body.ocultarAutores === 'true' });
    if (req.body.termoAutorizacao === 'true' && !tcc.termoAutorizacao.aceito) tcc.termoAutorizacao = { aceito:true, aceitoEm:new Date() };
    const pdf = req.files?.pdf?.[0]; const capa = req.files?.capa?.[0];
    if (pdf && pdf.buffer.subarray(0,5).toString() !== '%PDF-') throw new Error('O arquivo enviado não é um PDF válido.');
    if (pdf) tcc.pdf = { dados:pdf.buffer, nome:pdf.originalname, mime:pdf.mimetype, tamanho:pdf.size };
    if (capa) tcc.capa = { dados:capa.buffer, mime:capa.mimetype };
    if (req.body.acao === 'enviar') {
      if (!tcc.pdf?.dados) throw new Error('Anexe o PDF antes de enviar.');
      if (!tcc.termoAutorizacao.aceito) throw new Error('Aceite o termo de autorização antes de enviar o TCC.');
      tcc.status = tcc.status === 'Correções solicitadas' ? 'Reenviado' : 'Enviado';
      tcc.historico.push({ status:tcc.status, observacao:'Versão final enviada ao professor orientador.', usuario:req.session.usuario.id });
    }
    await tcc.save(); req.flash('sucesso','TCC atualizado.'); res.redirect('/tcc/edt/' + tcc.id);
  };

  revisar = async (req, res) => {
    const tcc = await Tcc.findById(req.params.id);
    if (!tcc) throw new Error('TCC não encontrado.');
    const status = req.body.status;
    if (!validarTransicao(tcc.status,status,req.session.usuario.perfil)) throw new Error(`Não é permitido alterar de “${tcc.status}” para “${status}”.`);
    if (req.session.usuario.perfil === 'professor' && !ehDono(tcc.orientador, req.session.usuario)) throw Object.assign(new Error('Este trabalho não está sob sua orientação.'), { status:403 });
    if (status === 'Publicado' && !tcc.termoAutorizacao.aceito) throw new Error('O aluno ainda não aceitou o termo de autorização para publicação.');
    tcc.status = status;
    if (status === 'Publicado') { tcc.publicadoEm = new Date(); tcc.liberadoEm = new Date(); tcc.liberadoPor = req.session.usuario.id; }
    const observacao = req.body.observacao || (status === 'Publicado' ? 'Professor orientador liberou o TCC para o catálogo público.' : 'Avaliação atualizada.');
    tcc.historico.push({ status, observacao, usuario:req.session.usuario.id });
    await tcc.save(); req.flash('sucesso','Avaliação registrada.'); res.redirect('/tcc/edt/' + tcc.id);
  };

  del = async (req, res) => {
    const tcc = await Tcc.findById(req.params.id);
    if (!tcc || (!ehDono(tcc.alunoResponsavel, req.session.usuario) && req.session.usuario.perfil !== 'administrador')) throw Object.assign(new Error('Acesso negado.'), { status:403 });
    if (req.session.usuario.perfil !== 'administrador' && tcc.status !== 'Rascunho') throw new Error('Somente rascunhos podem ser excluídos.');
    await tcc.deleteOne(); req.flash('sucesso','TCC excluído.'); res.redirect('/tcc/lst');
  };

  catalogo = async (req, res) => {
    const { q='', curso='', turma='', ano='', area='', orientador='', ordem='recentes' } = req.query;
    const filtro = { status:'Publicado' };
    if (q) { const busca = new RegExp(regexSegura(q), 'i'); const orientadoresEncontrados = await Usuario.find({perfil:'professor',nome:busca}).distinct('_id'); filtro.$or = [{titulo:busca},{resumo:busca},{palavrasChave:busca},{autores:busca},{orientador:{$in:orientadoresEncontrados}}]; }
    if (curso) filtro.curso=curso; if (turma) filtro.turma=turma; if (ano) filtro.ano=Number(ano); if (area) filtro.area=area; if (orientador) filtro.orientador=orientador;
    const ordenacao = ordem === 'az' ? {titulo:1} : ordem === 'visualizados' ? {visualizacoes:-1} : {publicadoEm:-1};
    const [resultado,cursos,turmas,orientadores,areas] = await Promise.all([Tcc.find(filtro).select('-pdf.dados -capa.dados').populate('curso turma orientador').sort(ordenacao),Curso.find({ativo:true}),Turma.find({ativa:true}),Usuario.find({perfil:'professor',aprovado:true}),Tcc.distinct('area',{status:'Publicado'})]);
    res.render('catalogo-db',{title:'Acervo de TCCs',resultado,cursos,turmas,orientadores,areas,query:req.query});
  };

  detalhes = async (req, res) => {
    const tcc = await Tcc.findOneAndUpdate({_id:req.params.id,status:'Publicado'},{$inc:{visualizacoes:1}},{new:true}).select('-pdf.dados').populate('curso turma orientador');
    if (!tcc) return res.status(404).render('404',{title:'Trabalho não encontrado'});
    const relacionados = await Tcc.find({_id:{$ne:tcc.id},status:'Publicado',$or:[{curso:tcc.curso._id},{area:tcc.area}]}).select('-pdf.dados -capa.dados').populate('curso').limit(3);
    res.render('detalhes-db',{title:tcc.titulo,tcc,relacionados});
  };

  capa = async (req, res) => { const tcc=await Tcc.findOne({_id:req.params.id,status:'Publicado'}).select('capa'); if(!tcc?.capa?.dados)return res.status(404).end(); res.type(tcc.capa.mime).send(tcc.capa.dados); };
  pdf = async (req, res) => { const tcc=await Tcc.findOne({_id:req.params.id,status:'Publicado'}).select('pdf'); if(!tcc?.pdf?.dados)return res.status(404).end(); res.type('pdf').set('Content-Disposition','inline; filename="'+tcc.pdf.nome.replace(/["\r\n]/g,'')+'"').send(tcc.pdf.dados); };
  download = async (req, res) => { const config=await Configuracao.findOne({chave:'geral'});if(config&&!config.permitirDownloads)throw Object.assign(new Error('Downloads estão temporariamente desativados.'),{status:403});const tcc=await Tcc.findOneAndUpdate({_id:req.params.id,status:'Publicado'},{$inc:{downloads:1}},{new:true}).select('pdf'); if(!tcc?.pdf?.dados)return res.status(404).end(); res.type('pdf').set('Content-Disposition','attachment; filename="'+tcc.pdf.nome.replace(/["\r\n]/g,'')+'"').send(tcc.pdf.dados); };
}
