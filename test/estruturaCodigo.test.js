// Funcionalidade exclusiva do AcervoTCC: garante que a organização continue no padrão dos projetos da autora.
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
    assert.match(codigo, new RegExp(`export default class ${entidade}Controller\\{`));
    assert.match(codigo, /constructor\(caminhoBase=/);
    assert.match(codigo, /this\.caminhoBase = caminhoBase/);
    assert.match(codigo, /this\.[a-zA-Z]+ = async\(req, res\)=>\{/);
  });
});

test('rotas de entidade usam controle e caminhobase como nos projetos de referência', () => {
  [
    'Aprendizagem',
    'Configuracao',
    'Curso',
    'Denuncia',
    'Ideia',
    'Modulo',
    'Painel',
    'Tcc',
    'Turma',
    'Usuario'
  ].forEach(entidade => {
    const codigo = readFileSync(`routes/${entidade}Routes.js`, 'utf8');
    assert.match(codigo, /const controle = new [A-Za-z]+Controller\(\)/);
    assert.match(codigo, /const caminhobase =/);
  });
});

test('funcionalidades que não existem nas referências são identificadas no código', () => {
  [
    'controllers/AuthController.js',
    'controllers/IdeiaController.js',
    'controllers/TccController.js',
    'middlewares/autorizacao.js',
    'middlewares/csrf.js',
    'middlewares/upload.js',
    'utils/fluxoTcc.js'
  ].forEach(arquivo => {
    const codigo = readFileSync(arquivo, 'utf8');
    assert.match(codigo, /Funcionalidade exclusiva do AcervoTCC:/);
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

  const paginaTcc = readFileSync('views/tcc/add.ejs', 'utf8');
  assert.match(paginaTcc, /<%-include\('\.\.\/cabecalho\.ejs'\)%>/);
  assert.match(paginaTcc, /<%-include\('\.\.\/rodape\.ejs'\)%>/);
});

test('entrada serverless segue o mesmo arquivo intermediário dos projetos de referência', () => {
  assert.ok(existsSync('indexvercell.js'));
  const api = readFileSync('api/index.js', 'utf8');
  assert.match(api, /import app from '\.\.\/indexvercell\.js'/);
});
