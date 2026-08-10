import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { conectarBanco } from '../config/conexao.js';
import Usuario from '../models/usuario.js';
import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Modulo from '../models/modulo.js';
import Configuracao from '../models/configuracao.js';

if (!process.env.MONGODB_URI) throw new Error('Defina MONGODB_URI antes de executar o seed.');
await conectarBanco();

const cursosBase = [
  ['Desenvolvimento de Sistemas','DS'],['Administração','ADM'],['Meio Ambiente','MA'],['Enfermagem','ENF']
];
const cursos=[];
for(const [nome,sigla] of cursosBase) cursos.push(await Curso.findOneAndUpdate({nome},{$set:{sigla,ativo:true}},{upsert:true,new:true}));
for(const curso of cursos) await Turma.findOneAndUpdate({nome:`3º ${curso.sigla}`,curso:curso.id,ano:new Date().getFullYear()},{$set:{ativa:true}},{upsert:true});

const titulos=['Como escolher um tema','Como identificar e definir um problema','Como criar o objetivo geral','Como criar objetivos específicos','Como escrever a justificativa','Como definir a metodologia','Como pesquisar fontes confiáveis','Como fazer citações e referências','Estrutura e formatação do TCC','Como preparar a apresentação','Checklist para a entrega final'];
for(const [indice,titulo] of titulos.entries()) await Modulo.findOneAndUpdate({ordem:indice+1},{$set:{titulo,explicacao:`Neste módulo, você aprenderá ${titulo.toLowerCase()} de forma prática, conectando a pesquisa a um problema real e verificável. Registre suas decisões e valide cada etapa com o professor orientador.`,exemplo:'Transforme uma ideia ampla em uma decisão clara, específica e possível de executar dentro do prazo do curso.',dicas:['Converse com pessoas afetadas pelo problema.','Registre as fontes e decisões desde o início.','Valide a etapa com o orientador antes de avançar.'],errosComuns:['Escolher um escopo grande demais.','Copiar soluções sem analisar o contexto.'],publicado:true}},{upsert:true});

const email=process.env.ADMIN_EMAIL||'admin@escola.edu.br';
const senha=process.env.ADMIN_PASSWORD;
if (!senha || senha.length < 12 || senha === 'troque-por-uma-senha-forte') throw new Error('Defina ADMIN_PASSWORD com pelo menos 12 caracteres antes de executar o seed.');
await Usuario.findOneAndUpdate({email},{$set:{nome:'Administrador AcervoTCC',senha:await bcrypt.hash(senha,12),perfil:'administrador',aprovado:true,emailConfirmado:true,ativo:true}},{upsert:true});
await Configuracao.findOneAndUpdate({chave:'geral'},{$setOnInsert:{instituicao:'Escola Técnica Estadual',contato:email}},{upsert:true});
console.log(`Dados iniciais criados. Administrador: ${email}`);
process.exit(0);
