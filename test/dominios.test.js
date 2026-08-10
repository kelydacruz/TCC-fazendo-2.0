import test from 'node:test';
import assert from 'node:assert/strict';
import { lerDominios, perfilDoEmail, loginRapidoAtivo } from '../config/dominios.js';

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
