import test from 'node:test';
import assert from 'node:assert/strict';
import { alunoPodeEnviarPara, turmaPertenceAoCurso } from '../utils/vinculoAcademico.js';

test('aluno só pode enviar TCC para seu próprio curso e turma',()=>{
  const aluno={perfil:'aluno',curso:'curso-1',turma:'turma-1'};
  assert.equal(alunoPodeEnviarPara(aluno,'curso-1','turma-1'),true);
  assert.equal(alunoPodeEnviarPara(aluno,'curso-2','turma-1'),false);
  assert.equal(alunoPodeEnviarPara(aluno,'curso-1','turma-2'),false);
});

test('professor e administrador não usam vínculo acadêmico de aluno',()=>{
  assert.equal(alunoPodeEnviarPara({perfil:'professor'},'curso-1','turma-1'),true);
  assert.equal(alunoPodeEnviarPara({perfil:'administrador'},'curso-1','turma-1'),true);
});

test('turma precisa pertencer ao curso selecionado',()=>{
  assert.equal(turmaPertenceAoCurso({curso:'curso-1'},'curso-1'),true);
  assert.equal(turmaPertenceAoCurso({curso:'curso-2'},'curso-1'),false);
});
