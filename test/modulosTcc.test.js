import test from 'node:test';
import assert from 'node:assert/strict';
import modulosTcc from '../data/modulosTcc.js';

test('trilha contém os 11 módulos planejados na ordem correta',()=>{
  assert.equal(modulosTcc.length,11);
  assert.deepEqual(modulosTcc.map(item=>item.ordem),[1,2,3,4,5,6,7,8,9,10,11]);
  assert.equal(new Set(modulosTcc.map(item=>item.titulo)).size,11);
});

test('cada módulo possui tutorial, exemplo, orientações e material',()=>{
  for(const modulo of modulosTcc){
    assert.ok(modulo.explicacao.length>300,`explicação insuficiente no módulo ${modulo.ordem}`);
    assert.ok(modulo.exemplo.length>100,`exemplo insuficiente no módulo ${modulo.ordem}`);
    assert.ok(modulo.dicas.length>=3,`dicas insuficientes no módulo ${modulo.ordem}`);
    assert.ok(modulo.errosComuns.length>=3,`erros comuns insuficientes no módulo ${modulo.ordem}`);
    assert.match(modulo.materialUrl,/^\/public\/materiais\/.+\.md$/);
  }
});
