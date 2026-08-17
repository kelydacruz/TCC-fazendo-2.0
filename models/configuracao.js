// Funcionalidade exclusiva do AcervoTCC: configurações gerais administradas pela instituição.
import conexao from '../config/conexao.js';

const Configuracao = new conexao.Schema({
    chave: {
        type: String,
        default: 'geral',
        unique: true
    },
    instituicao: {
        type: String,
        default: 'Escola Técnica Estadual'
    },
    contato: {
        type: String,
        default: 'contato@escola.edu.br'
    },
    endereco: String,
    privacidade: String,
    permitirCadastro: {
        type: Boolean,
        default: true
    },
    permitirDownloads: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Evita recriar o mesmo model durante testes e execuções serverless.
export default conexao.models.Configuracao || conexao.model('Configuracao', Configuracao);
