import conexao from '../config/conexao.js';
const Turma = new conexao.Schema({
  nome: { type: String, required: true, trim: true },
  curso: { type: conexao.Schema.Types.ObjectId, ref: 'Curso', required: true },
  ano: { type: Number, required: true, min: 2000, max: 2100 },
  ativa: { type: Boolean, default: true }
}, { timestamps: true });
Turma.index({ nome: 1, curso: 1, ano: 1 }, { unique: true });
export default conexao.models.Turma || conexao.model('Turma', Turma);
