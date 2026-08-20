// Funcionalidade exclusiva do AcervoTCC: separa os domínios institucionais de alunos e professores.
function normalizarDominio(valor) {
    return String(valor || '').trim().toLowerCase().replace(/^@/, '');
}

export function lerDominios(valor) {
    return String(valor || '').split(',').map(normalizarDominio).filter(Boolean);
}

export function dominiosInstitucionais() {
    return {
        aluno: lerDominios(process.env.ALUNO_EMAIL_DOMAINS),
        professor: lerDominios(process.env.PROFESSOR_EMAIL_DOMAINS)
    };
}

export function perfilDoEmail(email) {
    const partes = String(email || '').trim().toLowerCase().split('@');
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
    const dominio = normalizarDominio(partes[1]);
    const configurados = dominiosInstitucionais();
    if (configurados.aluno.includes(dominio) && configurados.professor.includes(dominio)) return null;
    if (configurados.aluno.includes(dominio)) return 'aluno';
    if (configurados.professor.includes(dominio)) return 'professor';
    return null;
}

// Funcionalidade exclusiva do AcervoTCC: cria contas rápidas diferentes para os testes locais.
export function contaDeTeste(chave) {
    const contas = {
        aluno: {
            nome: 'Aluno de Teste 1',
            perfil: 'aluno',
            prefixo: 'aluno.teste'
        },
        'aluno-2': {
            nome: 'Aluno de Teste 2',
            perfil: 'aluno',
            prefixo: 'aluno2.teste'
        },
        professor: {
            nome: 'Professor de Teste',
            perfil: 'professor',
            prefixo: 'professor.teste'
        }
    };
    const conta = contas[chave];
    if (!conta) return null;

    const dominios = dominiosInstitucionais();
    const dominio = dominios[conta.perfil]?.[0] || `${conta.perfil}.teste.invalid`;
    return {
        nome: conta.nome,
        perfil: conta.perfil,
        email: `${conta.prefixo}@${dominio}`
    };
}

export function emailDeTeste(perfil) {
    return contaDeTeste(perfil)?.email;
}

export function loginRapidoAtivo() {
    return process.env.NODE_ENV !== 'production' && process.env.DEV_QUICK_LOGIN === 'true';
}
