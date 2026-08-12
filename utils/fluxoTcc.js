const TRANSICOES_PROFESSOR = {
  'Enviado': ['Aguardando revisão','Correções solicitadas','Aprovado'],
  'Reenviado': ['Aguardando revisão','Correções solicitadas','Aprovado'],
  'Aguardando revisão': ['Correções solicitadas','Aprovado'],
  'Aprovado': ['Publicado']
};

export function acoesAvaliacao(status, perfil) {
  if (!['professor','administrador'].includes(perfil)) return [];
  const acoes = [...(TRANSICOES_PROFESSOR[status] || [])].filter(acao=>perfil!=='administrador'||acao!=='Publicado');
  if (perfil === 'administrador' && status !== 'Arquivado' && !acoes.includes('Arquivado')) acoes.push('Arquivado');
  return acoes;
}

export function validarTransicao(statusAtual, novoStatus, perfil) {
  return acoesAvaliacao(statusAtual, perfil).includes(novoStatus);
}

export function visivelParaProfessor(status) {
  return status !== 'Rascunho';
}

export function descricaoStatus(status) {
  return {
    'Rascunho':'O aluno ainda está preparando o envio.',
    'Enviado':'Versão final enviada pelo aluno ao professor orientador.',
    'Aguardando revisão':'O professor iniciou a conferência do trabalho.',
    'Correções solicitadas':'O aluno precisa enviar uma versão corrigida.',
    'Reenviado':'Uma nova versão foi enviada ao professor.',
    'Aprovado':'Avaliação concluída; aguarda liberação do professor para o site.',
    'Publicado':'O professor liberou o TCC para o catálogo público.',
    'Arquivado':'O trabalho foi retirado do fluxo ativo.'
  }[status] || '';
}
