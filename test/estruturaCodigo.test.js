import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const entidades = [
  'Curso',
  'Turma',
  'Usuario',
  'Modulo',
  'Denuncia',
  'Configuracao'
];

test('responsabilidades administrativas são separadas por entidade', () => {
  entidades.forEach(entidade => {
    assert.ok(existsSync(`controllers/${entidade}Controller.js`));
    assert.ok(existsSync(`routes/${entidade}Routes.js`));
  });

  assert.equal(existsSync('controllers/AdminController.js'), false);
  assert.equal(existsSync('routes/AdminRoutes.js'), false);
});

test('controllers principais seguem o padrão de classe e caminho base', () => {
  ['Tcc', 'Ideia', 'Curso', 'Usuario', 'Auth'].forEach(entidade => {
    const codigo = readFileSync(`controllers/${entidade}Controller.js`, 'utf8');
    assert.match(codigo, new RegExp(`export default class ${entidade}Controller`));
    assert.match(codigo, /constructor\(caminhoBase/);
    assert.match(codigo, /this\.caminhoBase = caminhoBase/);
  });
});

test('views possuem cabeçalho e rodapé no padrão do projeto de referência', () => {
  assert.ok(existsSync('views/cabecalho.ejs'));
  assert.ok(existsSync('views/rodape.ejs'));

  const cabecalho = readFileSync('views/cabecalho.ejs', 'utf8');
  const rodape = readFileSync('views/rodape.ejs', 'utf8');
  assert.match(cabecalho, /<!doctype html>/i);
  assert.match(cabecalho, /<main id="conteudo">/);
  assert.match(rodape, /<footer>/);
  assert.match(rodape, /<\/html>/);
});
