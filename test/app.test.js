// Funcionalidade exclusiva do AcervoTCC: testes automatizados da aplicação.
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

let servidor;
let base;
test.before(async()=>{servidor=app.listen(0);await new Promise(resolve=>servidor.once('listening',resolve));base=`http://127.0.0.1:${servidor.address().port}`;});
test.after(()=>servidor.close());

test('página inicial sem banco começa vazia e não exibe números fictícios',async()=>{const resposta=await fetch(base+'/');const html=await resposta.text();assert.equal(resposta.status,200);assert.match(html,/AcervoTCC/);assert.match(html,/Conhecimento que inspira/);assert.match(html,/Trabalhos publicados<\/span>/);assert.doesNotMatch(html,/70\+|12 mil|3 mil/);});
test('catálogo é público, mas visitante não acessa o Banco de Ideias',async()=>{const [respostaTcc,respostaIdeia,respostaDetalhe]=await Promise.all([fetch(base+'/tccs'),fetch(base+'/ideias',{redirect:'manual'}),fetch(base+'/ideias/qualquer-id',{redirect:'manual'})]);const htmlTcc=await respostaTcc.text();assert.equal(respostaTcc.status,200);assert.match(htmlTcc,/O acervo ainda está vazio/);for(const resposta of [respostaIdeia,respostaDetalhe]){assert.equal(resposta.status,302);assert.equal(resposta.headers.get('location'),'/entrar');}});
test('navegação pública não revela o Banco de Ideias',async()=>{const resposta=await fetch(base+'/');const html=await resposta.text();assert.doesNotMatch(html,/href="\/ideias"/);});
test('tela de login contém token CSRF e campos acessíveis',async()=>{const resposta=await fetch(base+'/entrar');const html=await resposta.text();assert.equal(resposta.status,200);assert.match(html,/name="_csrf"/);assert.match(html,/autocomplete="email"/);});
test('cadastro não permite escolher o perfil',async()=>{const resposta=await fetch(base+'/cadastro');const html=await resposta.text();assert.equal(resposta.status,200);assert.doesNotMatch(html,/name="perfil"/);assert.match(html,/domínio identifica automaticamente/);});
test('login rápido aparece quando habilitado em desenvolvimento',async()=>{const anterior=process.env.DEV_QUICK_LOGIN;process.env.DEV_QUICK_LOGIN='true';const resposta=await fetch(base+'/entrar');const html=await resposta.text();assert.match(html,/Entrar como aluno/);assert.match(html,/Entrar como professor/);if(anterior===undefined)delete process.env.DEV_QUICK_LOGIN;else process.env.DEV_QUICK_LOGIN=anterior;});
test('rota inexistente responde 404',async()=>{const resposta=await fetch(base+'/pagina-inexistente');assert.equal(resposta.status,404);});
