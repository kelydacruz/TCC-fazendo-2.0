import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css=await readFile(new URL('../public/css/components.css',import.meta.url),'utf8');
const bancoIdeias=await readFile(new URL('../views/ideia/lst.ejs',import.meta.url),'utf8');

test('banner permite que a barra de pesquisa interna apareça inteira',()=>{
  assert.match(css,/\.page-hero\s*\{[^}]*overflow:\s*visible/s);
  assert.match(css,/\.busca-interna\s*\{[^}]*position:\s*relative[^}]*z-index:\s*4/s);
});

test('tema usa a paleta roxa acadêmica com degradê',()=>{
  assert.match(css,/--primaria:\s*#6d28d9/);
  assert.match(css,/--primaria-escura:\s*#3b1d6b/);
  assert.match(css,/--primaria-clara:\s*#f1ebff/);
  assert.match(css,/linear-gradient\(135deg, #7c3aed, #5b21b6\)/);
});

test('Banco de Ideias usa o mesmo título das outras páginas internas',()=>{
  assert.match(bancoIdeias,/<section class="page-hero">/);
  assert.doesNotMatch(bancoIdeias,/ideias-hero/);
  assert.match(bancoIdeias,/class="btn btn-primario"[^>]*>[^<]*<i[^>]*><\/i> Publicar ideia/);
});
