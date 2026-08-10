import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

let servidor;
let base;
test.before(async()=>{servidor=app.listen(0);await new Promise(resolve=>servidor.once('listening',resolve));base=`http://127.0.0.1:${servidor.address().port}`;});
test.after(()=>servidor.close());

test('página inicial renderiza o protótipo público sem banco',async()=>{const resposta=await fetch(base+'/');const html=await resposta.text();assert.equal(resposta.status,200);assert.match(html,/AcervoTCC/);assert.match(html,/Conhecimento que inspira/);});
test('tela de login contém token CSRF e campos acessíveis',async()=>{const resposta=await fetch(base+'/entrar');const html=await resposta.text();assert.equal(resposta.status,200);assert.match(html,/name="_csrf"/);assert.match(html,/autocomplete="email"/);});
test('cadastro não permite escolher o perfil',async()=>{const resposta=await fetch(base+'/cadastro');const html=await resposta.text();assert.equal(resposta.status,200);assert.doesNotMatch(html,/name="perfil"/);assert.match(html,/domínio identifica automaticamente/);});
test('login rápido aparece quando habilitado em desenvolvimento',async()=>{const anterior=process.env.DEV_QUICK_LOGIN;process.env.DEV_QUICK_LOGIN='true';const resposta=await fetch(base+'/entrar');const html=await resposta.text();assert.match(html,/Entrar como aluno/);assert.match(html,/Entrar como professor/);if(anterior===undefined)delete process.env.DEV_QUICK_LOGIN;else process.env.DEV_QUICK_LOGIN=anterior;});
test('rota inexistente responde 404',async()=>{const resposta=await fetch(base+'/pagina-inexistente');assert.equal(resposta.status,404);});
