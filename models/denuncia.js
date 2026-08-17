// Funcionalidade exclusiva do AcervoTCC: denúncias de conteúdo inadequado.
import conexao from '../config/conexao.js';

const Denuncia = new conexao.Schema({
    comentario: {
        type: conexao.Types.ObjectId,
        ref: 'Comentario',
        required: true
    },
    denunciante: {
        type: conexao.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    motivo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['Pendente', 'Analisada', 'Descartada'],
        default: 'Pendente'
    }
}, { timestamps: true });

Denuncia.index({ comentario: 1, denunciante: 1 }, { unique: true });

// Evita recriar o mesmo model durante testes e execuções serverless.
export default conexao.models.Denuncia || conexao.model('Denuncia', Denuncia);
