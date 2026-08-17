// Funcionalidade exclusiva do AcervoTCC: perfis, aprovação, favoritos e progresso do usuário.
import conexao from '../config/conexao.js';

const Usuario = new conexao.Schema({
    nome: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    senha: {
        type: String,
        required: true,
        select: false
    },
    perfil: {
        type: String,
        enum: ['aluno', 'professor', 'administrador'],
        default: 'aluno'
    },
    curso: {
        type: conexao.Types.ObjectId,
        ref: 'Curso'
    },
    turma: {
        type: conexao.Types.ObjectId,
        ref: 'Turma'
    },
    aprovado: {
        type: Boolean,
        default: false
    },
    emailConfirmado: {
        type: Boolean,
        default: false
    },
    ativo: {
        type: Boolean,
        default: true
    },
    tokenEmail: {
        type: String,
        select: false
    },
    tokenRecuperacao: {
        type: String,
        select: false
    },
    expiraRecuperacao: {
        type: Date,
        select: false
    },
    favoritosTcc: [{
        type: conexao.Types.ObjectId,
        ref: 'Tcc'
    }],
    favoritosIdeia: [{
        type: conexao.Types.ObjectId,
        ref: 'Ideia'
    }],
    progressoModulos: [{
        type: conexao.Types.ObjectId,
        ref: 'Modulo'
    }]
}, { timestamps: true });

// Evita recriar o mesmo model durante testes e execuções serverless.
export default conexao.models.Usuario || conexao.model('Usuario', Usuario);
