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

export function emailDeTeste(perfil) {
    const dominios = dominiosInstitucionais();
    const dominio = dominios[perfil]?.[0] || `${perfil}.teste.invalid`;
    return `${perfil}.teste@${dominio}`;
}

export function loginRapidoAtivo() {
    return process.env.NODE_ENV !== 'production' && process.env.DEV_QUICK_LOGIN === 'true';
}
