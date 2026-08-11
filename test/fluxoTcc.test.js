import test from 'node:test';
import assert from 'node:assert/strict';
import { acoesAvaliacao, descricaoStatus, validarTransicao } from '../utils/fluxoTcc.js';

test('aluno enviado não fica público automaticamente',()=>{assert.equal(validarTransicao('Enviado','Publicado','professor'),false);assert.equal(validarTransicao('Enviado','Aprovado','professor'),true);});
test('professor libera para o site somente após aprovação',()=>{assert.deepEqual(acoesAvaliacao('Aprovado','professor'),['Publicado']);assert.equal(validarTransicao('Aprovado','Publicado','professor'),true);});
test('administrador pode arquivar sem conceder publicação indevida',()=>{assert.ok(acoesAvaliacao('Enviado','administrador').includes('Arquivado'));assert.equal(validarTransicao('Correções solicitadas','Publicado','administrador'),false);});
test('status aprovado informa que ainda aguarda liberação',()=>assert.match(descricaoStatus('Aprovado'),/aguarda liberação do professor/));
