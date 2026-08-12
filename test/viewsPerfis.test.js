import test from 'node:test';
import assert from 'node:assert/strict';
import ejs from 'ejs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { descricaoUsoIdeia } from '../utils/usoIdeia.js';
import { STATUS_IDEIA } from '../models/ideia.js';

const raiz=dirname(fileURLToPath(import.meta.url));
const views=join(raiz,'..','views');
const comuns={caminhoAtual:'/painel',csrfToken:'token-de-teste',mensagens:[]};

async function renderizar(arquivo,locais){
  return ejs.renderFile(join(views,arquivo),{...comuns,...locais});
}

test('painel do aluno mostra envio e não exibe visão geral',async()=>{
  const html=await renderizar('painel/index.ejs',{title:'Painel',usuarioAtual:{id:'aluno-1',nome:'Aluno Teste',perfil:'aluno'},dados:{}});
  assert.match(html,/href="\/tcc\/add"/);
  assert.doesNotMatch(html,/>Visão geral</);
});

test('painel do professor exibe visão geral sem opção de envio',async()=>{
  const html=await renderizar('painel/index.ejs',{title:'Painel',usuarioAtual:{id:'prof-1',nome:'Professor Teste',perfil:'professor'},dados:{aguardandoRevisao:0}});
  assert.match(html,/>Visão geral</);
  assert.doesNotMatch(html,/href="\/tcc\/add"/);
});

test('lista de TCC restringe o botão de envio ao aluno',async()=>{
  const aluno=await renderizar('tcc/lst.ejs',{title:'Meus TCCs',usuarioAtual:{id:'aluno-1',nome:'Aluno Teste',perfil:'aluno'},tccs:[]});
  const professor=await renderizar('tcc/lst.ejs',{title:'TCCs orientados',usuarioAtual:{id:'prof-1',nome:'Professor Teste',perfil:'professor'},tccs:[]});
  const administrador=await renderizar('tcc/lst.ejs',{title:'Todos os TCCs',usuarioAtual:{id:'adm-1',nome:'Administrador',perfil:'administrador'},tccs:[]});
  assert.match(aluno,/href="\/tcc\/add"/);
  assert.doesNotMatch(professor,/href="\/tcc\/add"/);
  assert.doesNotMatch(administrador,/href="\/tcc\/add"/);
});

test('ideia em desenvolvimento exibe quem está utilizando',async()=>{
  const ideia={id:'ideia-1',titulo:'Automação da biblioteca',descricao:'Projeto para organizar empréstimos.',problema:'Controle manual.',curso:{nome:'Técnico em Informática'},area:'Sistemas',dificuldade:'Intermediária',conhecimentos:['Web'],autor:{_id:'autor-1',nome:'Ana',perfil:'aluno'},status:'Em desenvolvimento',responsavelUso:{_id:'aluno-2',nome:'Bruno',perfil:'aluno'},createdAt:new Date('2026-08-01')};
  const html=await renderizar('ideia/detalhes.ejs',{title:ideia.titulo,caminhoAtual:'/ideias/ideia-1',usuarioAtual:{id:'aluno-3',nome:'Carla',perfil:'aluno'},ideia,comentarios:[],favorito:false,descricaoUso:descricaoUsoIdeia(ideia)});
  assert.match(html,/Em desenvolvimento por Bruno/);
  assert.match(html,/Responsável: <strong>Bruno<\/strong>/);
});

test('Banco de Ideias explica quem pode alterar os status',async()=>{
  const html=await renderizar('ideia/lst.ejs',{title:'Banco de Ideias',caminhoAtual:'/ideias',usuarioAtual:{id:'aluno-1',nome:'Aluno Teste',perfil:'aluno'},ideias:[],cursos:[],areas:[],statusIdeia:STATUS_IDEIA,query:{},descricaoUsoIdeia});
  assert.match(html,/Como funcionam os status das ideias/);
  assert.match(html,/somente professores e administradores/);
  assert.match(html,/Alterar status e moderar/);
});

test('moderação de ideia permite definir status, responsável e TCC utilizado',async()=>{
  const ideia={id:'ideia-1',titulo:'Automação da biblioteca',descricao:'Projeto para organizar empréstimos.',problema:'Controle manual.',curso:'curso-1',area:'Sistemas',dificuldade:'Intermediária',conhecimentos:['Web'],autor:'autor-1',status:'Utilizada',responsavelUso:'aluno-2',tccVinculado:'tcc-1'};
  const html=await renderizar('ideia/edt.ejs',{title:'Editar ideia',caminhoAtual:'/ideias/ideia-1/editar',usuarioAtual:{id:'prof-1',nome:'Professor Teste',perfil:'professor'},ideia,cursos:[{id:'curso-1',nome:'Técnico em Informática'}],usuariosUso:[{id:'aluno-2',nome:'Bruno',perfil:'aluno'}],tccs:[{id:'tcc-1',titulo:'Biblioteca inteligente'}],statusIdeia:STATUS_IDEIA});
  assert.match(html,/name="responsavelUso"/);
  assert.match(html,/Bruno · aluno/);
  assert.match(html,/TCC desenvolvido a partir da ideia/);
});
