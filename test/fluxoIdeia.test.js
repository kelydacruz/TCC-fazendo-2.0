import test from 'node:test';
import assert from 'node:assert/strict';
import { acoesIdeiaAluno, alunoResponsavelPelaIdeia, transicaoAluno } from '../utils/fluxoIdeia.js';

const aluno={id:'aluno-1',perfil:'aluno'};
const outroAluno={id:'aluno-2',perfil:'aluno'};

test('aluno pode reservar uma ideia disponível',()=>{
  const acoes=acoesIdeiaAluno({status:'Disponível'},aluno);
  assert.deepEqual(acoes.map(item=>item.acao),['reservar']);
  assert.equal(transicaoAluno('Disponível','reservar').para,'Reservada');
});

test('somente o aluno responsável controla uma ideia reservada',()=>{
  const ideia={status:'Reservada',responsavelUso:'aluno-1'};
  assert.deepEqual(acoesIdeiaAluno(ideia,aluno).map(item=>item.acao),['iniciar','liberar']);
  assert.deepEqual(acoesIdeiaAluno(ideia,outroAluno),[]);
  assert.equal(alunoResponsavelPelaIdeia(ideia,aluno),true);
  assert.equal(alunoResponsavelPelaIdeia(ideia,outroAluno),false);
});

test('aluno responsável pode concluir ou liberar uma ideia em desenvolvimento',()=>{
  const ideia={status:'Em desenvolvimento',responsavelUso:{_id:'aluno-1'}};
  assert.deepEqual(acoesIdeiaAluno(ideia,aluno).map(item=>item.acao),['liberar','utilizar']);
  assert.equal(transicaoAluno('Em desenvolvimento','utilizar').para,'Utilizada');
  assert.equal(transicaoAluno('Em desenvolvimento','reservar'),null);
});

test('professor e administrador não recebem ações de utilização do aluno',()=>{
  const ideia={status:'Disponível'};
  assert.deepEqual(acoesIdeiaAluno(ideia,{id:'prof-1',perfil:'professor'}),[]);
  assert.deepEqual(acoesIdeiaAluno(ideia,{id:'adm-1',perfil:'administrador'}),[]);
});
