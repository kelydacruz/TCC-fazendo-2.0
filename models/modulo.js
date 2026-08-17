// Funcionalidade exclusiva do AcervoTCC: módulos da trilha "Aprenda a fazer seu TCC".
import conexao from '../config/conexao.js';

const Modulo = new conexao.Schema({
    ordem: {
        type: Number,
        required: true,
        unique: true
    },
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    explicacao: {
        type: String,
        required: true,
        trim: true
    },
    exemplo: {
        type: String,
        trim: true
    },
    dicas: [{
        type: String,
        trim: true
    }],
    errosComuns: [{
        type: String,
        trim: true
    }],
    materialUrl: {
        type: String,
        trim: true
    },
    publicado: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Evita recriar o mesmo model durante testes e execuções serverless.
export default conexao.models.Modulo || conexao.model('Modulo', Modulo);
