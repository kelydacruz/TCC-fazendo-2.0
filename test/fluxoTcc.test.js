// Funcionalidade exclusiva do AcervoTCC: testes do fluxo de avaliação dos TCCs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { acoesAvaliacao, descricaoStatus, validarTransicao, visivelParaProfessor } from '../utils/fluxoTcc.js';

test('aluno enviado não fica público automaticamente',()=>{assert.equal(validarTransicao('Enviado','Publicado','professor'),false);assert.equal(validarTransicao('Enviado','Aprovado','professor'),true);});
test('aluno não pode executar nenhuma ação de avaliação',()=>assert.deepEqual(acoesAvaliacao('Enviado','aluno'),[]));
test('professor libera para o site somente após aprovação',()=>{assert.deepEqual(acoesAvaliacao('Aprovado','professor'),['Publicado']);assert.equal(validarTransicao('Aprovado','Publicado','professor'),true);});
test('administrador pode arquivar, mas não libera TCC para o catálogo',()=>{assert.ok(acoesAvaliacao('Enviado','administrador').includes('Arquivado'));assert.equal(validarTransicao('Correções solicitadas','Publicado','administrador'),false);assert.equal(validarTransicao('Aprovado','Publicado','administrador'),false);});
test('status aprovado informa que ainda aguarda liberação',()=>assert.match(descricaoStatus('Aprovado'),/aguarda liberação do professor/));
test('professor só visualiza o TCC depois que o aluno envia',()=>{assert.equal(visivelParaProfessor('Rascunho'),false);assert.equal(visivelParaProfessor('Enviado'),true);});
