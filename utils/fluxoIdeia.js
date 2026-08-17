// Funcionalidade exclusiva do AcervoTCC: regras de escolha e uso das ideias pelos alunos.
const TRANSICOES_ALUNO = {
    reservar: {
        de: ['Disponível'],
        para: 'Reservada',
        rotulo: 'Escolher esta ideia',
        confirmacao: 'Reservar esta ideia para você?'
    },
    iniciar: {
        de: ['Reservada'],
        para: 'Em desenvolvimento',
        rotulo: 'Iniciar desenvolvimento',
        confirmacao: 'Confirmar que você começou a desenvolver esta ideia?'
    },
    liberar: {
        de: ['Reservada', 'Em desenvolvimento'],
        para: 'Disponível',
        rotulo: 'Liberar para outro aluno',
        confirmacao: 'Liberar esta ideia para que outro aluno possa escolhê-la?'
    },
    utilizar: {
        de: ['Em desenvolvimento'],
        para: 'Utilizada',
        rotulo: 'Marcar como utilizada',
        confirmacao: 'Confirmar que esta ideia já foi utilizada em um projeto?'
    }
};

function id(valor) {
    return String(valor?._id || valor || '');
}

export function transicaoAluno(status, acao) {
    const transicao = TRANSICOES_ALUNO[acao];
    return transicao?.de.includes(status) ? transicao : null;
}

export function acoesIdeiaAluno(ideia, usuario) {
    if (usuario?.perfil !== 'aluno') return [];
    if (ideia.status === 'Disponível') {
        return [{ acao: 'reservar', ...TRANSICOES_ALUNO.reservar }];
    }
    if (id(ideia.responsavelUso) !== id(usuario.id)) return [];

    return Object.entries(TRANSICOES_ALUNO)
        .filter(([acao, item]) => acao !== 'reservar' && item.de.includes(ideia.status))
        .map(([acao, item]) => ({ acao, ...item }));
}

export function alunoResponsavelPelaIdeia(ideia, usuario) {
    return usuario?.perfil === 'aluno' && id(ideia.responsavelUso) === id(usuario.id);
}
