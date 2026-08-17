// Funcionalidade exclusiva do AcervoTCC: limpa o conteúdo acadêmico sem apagar as configurações.
import 'dotenv/config';
import { conectarBanco } from '../config/conexao.js';
import Curso from '../models/curso.js';
import Turma from '../models/turma.js';
import Tcc from '../models/tcc.js';
import Ideia from '../models/ideia.js';
import Comentario from '../models/comentario.js';
import Denuncia from '../models/denuncia.js';
import Usuario from '../models/usuario.js';

if (!process.argv.includes('--confirmar')) {
    throw new Error('Limpeza não confirmada. Use: npm run limpar:acervo -- --confirmar');
}

if (!process.env.MONGODB_URI) throw new Error('Defina MONGODB_URI antes de limpar o acervo.');

await conectarBanco();

const resultados = await Promise.all([
    Denuncia.deleteMany({}),
    Comentario.deleteMany({}),
    Ideia.deleteMany({}),
    Tcc.deleteMany({})
]);
const turmas = await Turma.deleteMany({});
const cursos = await Curso.deleteMany({});

await Usuario.updateMany(
    {},
    {
        $unset:{ curso:'', turma:'' },
        $set:{ favoritosTcc:[], favoritosIdeia:[] }
    }
);

const [denuncias,comentarios,ideias,tccs] = resultados.map(item=>item.deletedCount);
console.log('Acervo limpo com confirmação explícita.');
console.log(`${cursos.deletedCount} curso(s), ${turmas.deletedCount} turma(s), ${tccs} TCC(s), ${ideias} ideia(s), ${comentarios} comentário(s) e ${denuncias} denúncia(s) removidos.`);
console.log('Administradores, demais contas, configurações e módulos da trilha foram preservados.');
process.exit(0);
