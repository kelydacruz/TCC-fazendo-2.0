import conexao from '../config/conexao.js';

export const STATUS_TCC = [
  'Rascunho',
  'Enviado',
  'Aguardando revisão',
  'Correções solicitadas',
  'Reenviado',
  'Aprovado',
  'Publicado',
  'Arquivado'
];

const Historico = new conexao.Schema({
  status: {
    type: String,
    enum: STATUS_TCC,
    required: true
  },
  observacao: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  usuario: {
    type: conexao.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const Tcc = new conexao.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 240
  },
  resumo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 6000
  },
  palavrasChave: [{
    type: String,
    trim: true
  }],
  autores: [{
    type: String,
    required: true,
    trim: true
  }],
  alunoResponsavel: {
    type: conexao.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  orientador: {
    type: conexao.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  curso: {
    type: conexao.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  turma: {
    type: conexao.Schema.Types.ObjectId,
    ref: 'Turma',
    required: true
  },
  ano: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  pdf: {
    dados: Buffer,
    nome: String,
    mime: String,
    tamanho: Number
  },
  capa: {
    dados: Buffer,
    mime: String
  },
  status: {
    type: String,
    enum: STATUS_TCC,
    default: 'Rascunho'
  },
  termoAutorizacao: {
    aceito: { type: Boolean, default: false },
    aceitoEm: Date
  },
  ocultarAutores: {
    type: Boolean,
    default: false
  },
  publicadoEm: Date,
  liberadoPor: {
    type: conexao.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  liberadoEm: Date,
  visualizacoes: {
    type: Number,
    default: 0,
    min: 0
  },
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  historico: [Historico]
}, { timestamps: true });

Tcc.index({ titulo: 'text', resumo: 'text', palavrasChave: 'text', autores: 'text', area: 'text' });

export default conexao.models.Tcc || conexao.model('Tcc', Tcc);
