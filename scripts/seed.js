import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { conectarBanco } from '../config/conexao.js';
import { emailDeTeste } from '../config/dominios.js';
import Usuario from '../models/usuario.js';
import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Modulo from '../models/modulo.js';
import Tcc from '../models/tcc.js';
import Ideia from '../models/ideia.js';
import Comentario from '../models/comentario.js';
import Configuracao from '../models/configuracao.js';
import modulosTcc from '../data/modulosTcc.js';

if (!process.env.MONGODB_URI) throw new Error('Defina MONGODB_URI antes de executar o seed.');
await conectarBanco();

function pdfDemonstracao(titulo) {
  const texto = titulo.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'').replace(/[()\\]/g,'');
  const fluxo = `BT /F1 18 Tf 72 760 Td (${texto}) Tj 0 -35 Td /F1 11 Tf (Arquivo PDF ficticio criado pelo seed do AcervoTCC.) Tj ET`;
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(fluxo)} >>\nstream\n${fluxo}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  let conteudo = '%PDF-1.4\n';
  const offsets = [0];
  objetos.forEach((objeto, indice) => { offsets.push(Buffer.byteLength(conteudo)); conteudo += `${indice + 1} 0 obj\n${objeto}\nendobj\n`; });
  const inicioXref = Buffer.byteLength(conteudo);
  conteudo += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { conteudo += `${String(offset).padStart(10,'0')} 00000 n \n`; });
  conteudo += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;
  return Buffer.from(conteudo);
}

const anoAtual = new Date().getFullYear();
const cursosBase = [
  {nome:'Desenvolvimento de Sistemas',sigla:'DS',descricao:'Formação em análise, desenvolvimento, testes e manutenção de sistemas.'},
  {nome:'Administração',sigla:'ADM',descricao:'Formação em processos organizacionais, finanças, pessoas e empreendedorismo.'},
  {nome:'Meio Ambiente',sigla:'MA',descricao:'Formação em gestão ambiental, sustentabilidade e monitoramento de impactos.'},
  {nome:'Enfermagem',sigla:'ENF',descricao:'Formação técnica para o cuidado seguro e humanizado em saúde.'}
];
const cursos = [];
for (const dados of cursosBase) cursos.push(await Curso.findOneAndUpdate({nome:dados.nome},{$set:{...dados,ativo:true}},{upsert:true,new:true,runValidators:true}));

const turmas = new Map();
for (const curso of cursos) {
  for (const ano of [anoAtual-2,anoAtual-1,anoAtual]) {
    const turma = await Turma.findOneAndUpdate({nome:`3º ${curso.sigla}`,curso:curso.id,ano},{$set:{ativa:true}},{upsert:true,new:true,runValidators:true});
    turmas.set(`${curso.sigla}-${ano}`,turma);
  }
}

for (const modulo of modulosTcc) await Modulo.findOneAndUpdate({ordem:modulo.ordem},{$set:{...modulo,publicado:true}},{upsert:true,new:true,runValidators:true});

const senhaAleatoria = await bcrypt.hash(crypto.randomBytes(32).toString('hex'),12);
const aluno = await Usuario.findOneAndUpdate(
  {email:emailDeTeste('aluno')},
  {$set:{nome:'Aluno de Teste',perfil:'aluno',aprovado:true,emailConfirmado:true,ativo:true},$setOnInsert:{senha:senhaAleatoria}},
  {upsert:true,new:true,runValidators:true}
);
const professor = await Usuario.findOneAndUpdate(
  {email:emailDeTeste('professor')},
  {$set:{nome:'Professor de Teste',perfil:'professor',aprovado:true,emailConfirmado:true,ativo:true},$setOnInsert:{senha:senhaAleatoria}},
  {upsert:true,new:true,runValidators:true}
);

const tccsBase = [
  {titulo:'Sistema web para controle de empréstimos em laboratório',resumo:'Este trabalho apresenta o desenvolvimento e a avaliação de um sistema web para registrar empréstimos, devoluções e disponibilidade de equipamentos em um laboratório de informática. O protótipo foi planejado a partir do levantamento do processo atual e de testes de uso com dados fictícios.',palavrasChave:['sistema web','controle de empréstimos','usabilidade'],curso:'DS',ano:anoAtual,area:'Desenvolvimento Web',status:'Publicado'},
  {titulo:'Painel de indicadores para acompanhamento de estoque escolar',resumo:'O projeto propõe um painel de indicadores para apoiar o acompanhamento de entradas, saídas e níveis mínimos de materiais de uso escolar. O estudo organiza requisitos, critérios de visualização e um procedimento de avaliação da compreensão das informações.',palavrasChave:['indicadores','estoque','visualização de dados'],curso:'ADM',ano:anoAtual-1,area:'Gestão de Processos',status:'Publicado'},
  {titulo:'Protótipo de estação para monitoramento de qualidade do ar',resumo:'O trabalho descreve um protótipo didático de baixo custo para coletar e apresentar indicadores ambientais. São discutidos critérios de instalação, limitações dos sensores e uma proposta de uso responsável dos dados em atividades de educação ambiental.',palavrasChave:['qualidade do ar','sensores','educação ambiental'],curso:'MA',ano:anoAtual-1,area:'Monitoramento Ambiental',status:'Publicado'},
  {titulo:'Material educativo sobre segurança na administração de medicamentos',resumo:'A pesquisa desenvolve um material educativo voltado à revisão de práticas seguras na administração de medicamentos em ambiente de formação técnica. O conteúdo foi organizado com base em referências de saúde e avaliado quanto à clareza, linguagem e aplicabilidade didática.',palavrasChave:['segurança do paciente','medicamentos','material educativo'],curso:'ENF',ano:anoAtual-2,area:'Segurança do Paciente',status:'Publicado'},
  {titulo:'Aplicativo para organização de planos de estudo',resumo:'Este TCC desenvolve um protótipo de aplicativo para ajudar estudantes a distribuir atividades, prazos e períodos de revisão. A versão final foi avaliada pelo professor orientador e aguarda a liberação explícita para publicação no catálogo institucional.',palavrasChave:['aplicativo','planejamento','estudos'],curso:'DS',ano:anoAtual,area:'Aplicações Educacionais',status:'Aprovado'},
  {titulo:'Plano de comunicação digital para empreendimento estudantil',resumo:'O trabalho analisa necessidades de comunicação de um empreendimento estudantil fictício e propõe um plano de canais, calendário editorial e métricas. O professor solicitou ajustes na justificativa das métricas e na descrição do método de avaliação.',palavrasChave:['comunicação digital','planejamento','empreendedorismo'],curso:'ADM',ano:anoAtual,area:'Marketing',status:'Correções solicitadas'}
];

const tccs = [];
for (const [indice,dados] of tccsBase.entries()) {
  const curso = cursos.find(item=>item.sigla===dados.curso);
  const turma = turmas.get(`${dados.curso}-${dados.ano}`);
  const publicado = dados.status === 'Publicado';
  const dataBase = new Date(anoAtual, Math.max(0,10-indice), 5+indice);
  const historico = [{status:'Enviado',observacao:'Versão de demonstração enviada para avaliação.',usuario:aluno.id,data:dataBase}];
  if (['Aprovado','Publicado'].includes(dados.status)) historico.push({status:'Aprovado',observacao:'Avaliação final concluída pelo professor orientador.',usuario:professor.id,data:new Date(dataBase.getTime()+86400000)});
  if (dados.status === 'Correções solicitadas') historico.push({status:dados.status,observacao:'Revisar a justificativa das métricas e detalhar o procedimento de avaliação.',usuario:professor.id,data:new Date(dataBase.getTime()+86400000)});
  if (publicado) historico.push({status:'Publicado',observacao:'Professor orientador liberou o TCC para o catálogo público.',usuario:professor.id,data:new Date(dataBase.getTime()+172800000)});
  const pdf = pdfDemonstracao(dados.titulo);
  const tcc = await Tcc.findOneAndUpdate(
    {titulo:dados.titulo,alunoResponsavel:aluno.id},
    {$set:{titulo:dados.titulo,resumo:dados.resumo,palavrasChave:dados.palavrasChave,autores:[`Equipe Demonstrativa ${String(indice+1).padStart(2,'0')}`],alunoResponsavel:aluno.id,orientador:professor.id,curso:curso.id,turma:turma.id,ano:dados.ano,area:dados.area,pdf:{dados:pdf,nome:`tcc-demonstrativo-${indice+1}.pdf`,mime:'application/pdf',tamanho:pdf.length},status:dados.status,termoAutorizacao:{aceito:true,aceitoEm:dataBase},publicadoEm:publicado?new Date(dataBase.getTime()+172800000):undefined,liberadoPor:publicado?professor.id:undefined,liberadoEm:publicado?new Date(dataBase.getTime()+172800000):undefined,visualizacoes:publicado?(indice+1)*37:0,downloads:publicado?(indice+1)*9:0,historico}},
    {upsert:true,new:true,runValidators:true,setDefaultsOnInsert:true}
  );
  tccs.push(tcc);
}

const ideiasBase = [
  {titulo:'Mapa de acessibilidade dos espaços escolares',descricao:'Criar uma ferramenta colaborativa para registrar e visualizar barreiras e recursos de acessibilidade nos espaços da instituição.',problema:'Informações sobre rotas acessíveis e barreiras físicas ficam dispersas e nem sempre chegam às pessoas que precisam planejar o deslocamento.',curso:'DS',area:'Tecnologia Assistiva',dificuldade:'Intermediária',conhecimentos:['mapas digitais','desenvolvimento web','acessibilidade'],status:'Disponível'},
  {titulo:'Campanha para redução do desperdício no refeitório',descricao:'Planejar uma campanha baseada em medição de resíduos e comunicação educativa para reduzir o desperdício de alimentos.',problema:'A instituição não possui uma rotina simples para medir o desperdício e avaliar quais ações educativas produzem resultado.',curso:'MA',area:'Educação Ambiental',dificuldade:'Iniciante',conhecimentos:['coleta de dados','comunicação','sustentabilidade'],status:'Em análise'},
  {titulo:'Guia digital de acolhimento para novos estudantes',descricao:'Produzir um guia navegável com serviços, setores, horários e respostas às dúvidas mais frequentes de quem inicia o curso.',problema:'Estudantes novos recebem muitas informações em momentos diferentes e têm dificuldade de localizar orientações atualizadas.',curso:'ADM',area:'Comunicação Institucional',dificuldade:'Iniciante',conhecimentos:['organização da informação','redação','design'],status:'Reservada'},
  {titulo:'Simulador educativo de conferência de medicamentos',descricao:'Desenvolver uma experiência educativa com cenários fictícios para praticar etapas de conferência segura.',problema:'É necessário ampliar as oportunidades de prática orientada sem expor pacientes ou utilizar dados reais.',curso:'ENF',area:'Educação em Saúde',dificuldade:'Avançada',conhecimentos:['segurança do paciente','roteirização','prototipação'],status:'Em desenvolvimento'},
  {titulo:'Organizador de empréstimos do laboratório',descricao:'Centralizar o registro de equipamentos disponíveis, empréstimos e devoluções em uma interface acessível pela equipe do laboratório.',problema:'Anotações manuais incompletas dificultam acompanhar a localização e a disponibilidade dos equipamentos.',curso:'DS',area:'Desenvolvimento Web',dificuldade:'Intermediária',conhecimentos:['banco de dados','interfaces web','testes'],status:'Utilizada',tccVinculado:0}
];

const ideias = [];
for (const dados of ideiasBase) {
  const curso = cursos.find(item=>item.sigla===dados.curso);
  const ideia = await Ideia.findOneAndUpdate(
    {titulo:dados.titulo,autor:aluno.id},
    {$set:{...dados,curso:curso.id,autor:aluno.id,tccVinculado:dados.tccVinculado===0?tccs[0].id:undefined,moderada:dados.status!=='Disponível'}},
    {upsert:true,new:true,runValidators:true,setDefaultsOnInsert:true}
  );
  ideias.push(ideia);
}

const comentariosBase = [
  {ideia:ideias[0],autor:professor,texto:'A proposta pode começar por um único bloco da instituição e adotar critérios objetivos para classificar cada barreira.'},
  {ideia:ideias[0],autor:aluno,texto:'Boa sugestão. O recorte inicial permitirá validar o cadastro e a visualização antes de ampliar o mapa.'},
  {ideia:ideias[1],autor:professor,texto:'Incluam uma medição inicial e outra após a campanha para comparar os resultados com o mesmo procedimento.'}
];
for (const item of comentariosBase) await Comentario.findOneAndUpdate({ideia:item.ideia.id,autor:item.autor.id,texto:item.texto},{$set:{oculto:false}},{upsert:true,new:true,runValidators:true});

const email = process.env.ADMIN_EMAIL || 'admin@escola.edu.br';
const senha = process.env.ADMIN_PASSWORD;
if (!senha || senha.length < 12 || senha === 'troque-por-uma-senha-forte') throw new Error('Defina ADMIN_PASSWORD com pelo menos 12 caracteres antes de executar o seed.');
await Usuario.findOneAndUpdate({email},{$set:{nome:'Administrador AcervoTCC',senha:await bcrypt.hash(senha,12),perfil:'administrador',aprovado:true,emailConfirmado:true,ativo:true}},{upsert:true,runValidators:true});
await Configuracao.findOneAndUpdate({chave:'geral'},{$setOnInsert:{instituicao:'Escola Técnica Estadual',contato:email}},{upsert:true});
console.log(`Dados de demonstração criados: ${cursos.length} cursos, ${tccs.length} TCCs, ${ideias.length} ideias e ${modulosTcc.length} módulos.`);
console.log(`Administrador: ${email}`);
process.exit(0);
