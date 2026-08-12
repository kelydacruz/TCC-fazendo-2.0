import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css=await readFile(new URL('../public/css/components.css',import.meta.url),'utf8');

test('banner permite que a barra de pesquisa interna apareça inteira',()=>{
  assert.match(css,/\.page-hero\s*\{[^}]*overflow:\s*visible/s);
  assert.match(css,/\.busca-interna\s*\{[^}]*position:\s*relative[^}]*z-index:\s*4/s);
});

test('tema usa a paleta acadêmica clara atualizada',()=>{
  assert.match(css,/--primaria:\s*#85658f/);
  assert.match(css,/--primaria-escura:\s*#684a70/);
  assert.match(css,/linear-gradient\(135deg, #eee6f0, #d6c4db\)/);
});
