import conexao from '../config/conexao.js';

const Curso = new conexao.Schema({
  nome: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sigla: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default conexao.models.Curso || conexao.model('Curso', Curso);
