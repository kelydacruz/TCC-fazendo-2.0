// Funcionalidade exclusiva do AcervoTCC: testes dos domínios institucionais.
import test from 'node:test';
import assert from 'node:assert/strict';
import { contaDeTeste, lerDominios, perfilDoEmail, loginRapidoAtivo } from '../config/dominios.js';

test('domínios separados definem automaticamente o perfil',()=>{
  const alunoAnterior=process.env.ALUNO_EMAIL_DOMAINS;const professorAnterior=process.env.PROFESSOR_EMAIL_DOMAINS;
  process.env.ALUNO_EMAIL_DOMAINS='alunos.instituicao.edu.br';process.env.PROFESSOR_EMAIL_DOMAINS='docentes.instituicao.edu.br';
  assert.equal(perfilDoEmail('pessoa@alunos.instituicao.edu.br'),'aluno');
  assert.equal(perfilDoEmail('pessoa@docentes.instituicao.edu.br'),'professor');
  assert.equal(perfilDoEmail('pessoa@gmail.com'),null);
  if(alunoAnterior===undefined)delete process.env.ALUNO_EMAIL_DOMAINS;else process.env.ALUNO_EMAIL_DOMAINS=alunoAnterior;
  if(professorAnterior===undefined)delete process.env.PROFESSOR_EMAIL_DOMAINS;else process.env.PROFESSOR_EMAIL_DOMAINS=professorAnterior;
});
test('lista de domínios aceita vírgulas e arroba opcional',()=>assert.deepEqual(lerDominios('@um.edu.br, dois.edu.br'),['um.edu.br','dois.edu.br']));
test('domínio ambíguo não concede perfil',()=>{const alunoAnterior=process.env.ALUNO_EMAIL_DOMAINS;const professorAnterior=process.env.PROFESSOR_EMAIL_DOMAINS;process.env.ALUNO_EMAIL_DOMAINS='instituicao.edu.br';process.env.PROFESSOR_EMAIL_DOMAINS='instituicao.edu.br';assert.equal(perfilDoEmail('pessoa@instituicao.edu.br'),null);if(alunoAnterior===undefined)delete process.env.ALUNO_EMAIL_DOMAINS;else process.env.ALUNO_EMAIL_DOMAINS=alunoAnterior;if(professorAnterior===undefined)delete process.env.PROFESSOR_EMAIL_DOMAINS;else process.env.PROFESSOR_EMAIL_DOMAINS=professorAnterior;});
test('login rápido nunca fica ativo em produção',()=>{const ambiente=process.env.NODE_ENV;const flag=process.env.DEV_QUICK_LOGIN;process.env.NODE_ENV='production';process.env.DEV_QUICK_LOGIN='true';assert.equal(loginRapidoAtivo(),false);if(ambiente===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=ambiente;if(flag===undefined)delete process.env.DEV_QUICK_LOGIN;else process.env.DEV_QUICK_LOGIN=flag;});
test('alunos de teste possuem contas institucionais diferentes',()=>{const anterior=process.env.ALUNO_EMAIL_DOMAINS;process.env.ALUNO_EMAIL_DOMAINS='academico.ifsul.edu.br';const primeiro=contaDeTeste('aluno');const segundo=contaDeTeste('aluno-2');assert.equal(primeiro.perfil,'aluno');assert.equal(segundo.perfil,'aluno');assert.equal(primeiro.email,'aluno.teste@academico.ifsul.edu.br');assert.equal(segundo.email,'aluno2.teste@academico.ifsul.edu.br');assert.notEqual(primeiro.email,segundo.email);assert.equal(contaDeTeste('administrador'),null);if(anterior===undefined)delete process.env.ALUNO_EMAIL_DOMAINS;else process.env.ALUNO_EMAIL_DOMAINS=anterior;});
