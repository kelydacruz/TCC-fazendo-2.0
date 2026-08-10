import test from 'node:test';
import assert from 'node:assert/strict';
import Usuario from '../models/usuario.js';
import Tcc, { STATUS_TCC } from '../models/tcc.js';
import Ideia, { STATUS_IDEIA } from '../models/ideia.js';

test('novo usuário recebe perfil de aluno e aguarda aprovação',()=>{const usuario=new Usuario({nome:'Maria',email:'maria@escola.edu.br',senha:'hash'});assert.equal(usuario.perfil,'aluno');assert.equal(usuario.aprovado,false);assert.equal(usuario.emailConfirmado,false);});
test('fluxo do TCC contém todos os oito estados definidos',()=>assert.deepEqual(STATUS_TCC,['Rascunho','Enviado','Aguardando revisão','Correções solicitadas','Reenviado','Aprovado','Publicado','Arquivado']));
test('TCC sem metadados obrigatórios falha na validação',()=>{const erro=new Tcc({titulo:'Exemplo'}).validateSync();assert.ok(erro.errors.resumo);assert.ok(erro.errors.alunoResponsavel);assert.ok(erro.errors.orientador);});
test('status inválido de ideia é rejeitado',()=>{const ideia=new Ideia({status:'Inexistente'});const erro=ideia.validateSync();assert.ok(erro.errors.status);assert.ok(STATUS_IDEIA.includes('Utilizada'));});
