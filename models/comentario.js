// Funcionalidade exclusiva do AcervoTCC: comentários publicados no Banco de Ideias.
import conexao from '../config/conexao.js';

const Comentario = new conexao.Schema({
    ideia: {
        type: conexao.Types.ObjectId,
        ref: 'Ideia',
        required: true
    },
    autor: {
        type: conexao.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    texto: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 1500
    },
    oculto: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Evita recriar o mesmo model durante testes e execuções serverless.
export default conexao.models.Comentario || conexao.model('Comentario', Comentario);
