import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { conectarBanco } from '../config/conexao.js';
import Usuario from '../models/usuario.js';
import Modulo from '../models/modulo.js';
import Configuracao from '../models/configuracao.js';
import modulosTcc from '../data/modulosTcc.js';

if (!process.env.MONGODB_URI) throw new Error('Defina MONGODB_URI antes de executar a inicialização.');

const email = String(process.env.ADMIN_EMAIL || 'admin@escola.edu.br').trim().toLowerCase();
const senha = process.env.ADMIN_PASSWORD;

if (!senha || senha.length < 12 || senha === 'troque-por-uma-senha-forte') {
  throw new Error('Defina ADMIN_PASSWORD com pelo menos 12 caracteres antes de executar a inicialização.');
}

await conectarBanco();

for (const modulo of modulosTcc) {
  await Modulo.findOneAndUpdate(
    { ordem:modulo.ordem },
    { $set:{ ...modulo, publicado:true } },
    { upsert:true, new:true, runValidators:true }
  );
}

await Usuario.findOneAndUpdate(
  { email },
  { $set:{
    nome:'Administrador AcervoTCC',
    senha:await bcrypt.hash(senha,12),
    perfil:'administrador',
    aprovado:true,
    emailConfirmado:true,
    ativo:true
  } },
  { upsert:true, runValidators:true }
);

await Configuracao.findOneAndUpdate(
  { chave:'geral' },
  { $setOnInsert:{ instituicao:'Escola Técnica Estadual', contato:email } },
  { upsert:true }
);

console.log(`Inicialização concluída: administrador e ${modulosTcc.length} módulos da trilha preparados.`);
console.log('Nenhum curso ou turma foi criado. Cadastre-os pelo painel administrativo.');
console.log(`Administrador: ${email}`);
process.exit(0);
