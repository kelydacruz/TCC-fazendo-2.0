import conexao from '../config/conexao.js';
export const STATUS_IDEIA = ['Disponível','Em análise','Reservada','Em desenvolvimento','Utilizada','Arquivada'];
const Ideia = new conexao.Schema({
  titulo: { type: String, required: true, trim: true, maxlength: 200 },
  descricao: { type: String, required: true, trim: true, maxlength: 5000 },
  problema: { type: String, required: true, trim: true, maxlength: 3000 },
  curso: { type: conexao.Schema.Types.ObjectId, ref: 'Curso', required: true },
  area: { type: String, required: true, trim: true },
  dificuldade: { type: String, enum: ['Iniciante','Intermediária','Avançada'], required: true },
  conhecimentos: [{ type: String, trim: true }],
  autor: { type: conexao.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  status: { type: String, enum: STATUS_IDEIA, default: 'Disponível' },
  responsavelUso: { type: conexao.Schema.Types.ObjectId, ref: 'Usuario' },
  tccVinculado: { type: conexao.Schema.Types.ObjectId, ref: 'Tcc' },
  moderada: { type: Boolean, default: false }
}, { timestamps: true });
Ideia.index({ titulo: 'text', descricao: 'text', problema: 'text', area: 'text' });
export default conexao.models.Ideia || conexao.model('Ideia', Ideia);
