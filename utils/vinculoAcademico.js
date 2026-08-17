// Funcionalidade exclusiva do AcervoTCC: restringe o envio ao curso e à turma do aluno.
function id(valor) {
    return String(valor?._id || valor || '');
}

export function podeEnviarTcc(usuario) {
    return usuario?.perfil === 'aluno';
}

export function alunoPodeEnviarPara(usuario, curso, turma) {
    if (usuario?.perfil !== 'aluno') return true;
    return Boolean(id(usuario.curso) && id(usuario.turma) && id(usuario.curso) === id(curso) && id(usuario.turma) === id(turma));
}

export function turmaPertenceAoCurso(turma, curso) {
    return Boolean(id(turma?.curso) && id(turma.curso) === id(curso));
}
