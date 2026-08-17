// Funcionalidade exclusiva do AcervoTCC: identifica o aluno responsável por uma ideia em uso.
export const STATUS_IDEIA_COM_RESPONSAVEL = [
    'Reservada',
    'Em desenvolvimento',
    'Utilizada'
];

export function dadosDeUsoIdeia(status, responsavelUso, tccVinculado) {
    if (!STATUS_IDEIA_COM_RESPONSAVEL.includes(status)) {
        return {
            responsavelUso: undefined,
            tccVinculado: undefined
        };
    }

    return {
        responsavelUso: responsavelUso || undefined,
        tccVinculado: status === 'Utilizada' ? (tccVinculado || undefined) : undefined
    };
}

export function descricaoUsoIdeia(ideia) {
    const nome = ideia.responsavelUso?.nome;

    return {
        'Disponível': 'Livre para ser utilizada',
        'Em análise': 'Aguardando análise da instituição',
        'Reservada': nome ? `Reservada por ${nome}` : 'Reservada',
        'Em desenvolvimento': nome ? `Em desenvolvimento por ${nome}` : 'Em desenvolvimento',
        'Utilizada': nome ? `Já utilizada por ${nome}` : 'Já utilizada',
        'Arquivada': 'Indisponível para novos projetos'
    }[ideia.status] || ideia.status;
}
