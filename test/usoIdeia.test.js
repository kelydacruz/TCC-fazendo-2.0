// Funcionalidade exclusiva do AcervoTCC: testes dos dados de uso de uma ideia.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dadosDeUsoIdeia, descricaoUsoIdeia } from '../utils/usoIdeia.js';

test('ideia disponível fica livre e sem vínculos de utilização',()=>{
  assert.deepEqual(dadosDeUsoIdeia('Disponível','usuario-1','tcc-1'),{responsavelUso:undefined,tccVinculado:undefined});
  assert.equal(descricaoUsoIdeia({status:'Disponível'}),'Livre para ser utilizada');
});

test('ideia em desenvolvimento identifica o usuário responsável',()=>{
  assert.deepEqual(dadosDeUsoIdeia('Em desenvolvimento','usuario-1','tcc-1'),{responsavelUso:'usuario-1',tccVinculado:undefined});
  assert.equal(descricaoUsoIdeia({status:'Em desenvolvimento',responsavelUso:{nome:'Maria'}}),'Em desenvolvimento por Maria');
});

test('ideia utilizada preserva responsável e TCC vinculado',()=>{
  assert.deepEqual(dadosDeUsoIdeia('Utilizada','usuario-1','tcc-1'),{responsavelUso:'usuario-1',tccVinculado:'tcc-1'});
  assert.equal(descricaoUsoIdeia({status:'Utilizada',responsavelUso:{nome:'João'}}),'Já utilizada por João');
});
