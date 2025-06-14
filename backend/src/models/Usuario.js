const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  _id: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: () => new mongoose.Types.ObjectId(),
  },
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  senha: {
    type: String,
    required: true,
  },
  formacao: {
    type: String,
    required: true,
  },
  habilidades: [{
    type: String,
    required: true,
  }],
  dataInicialCargoAtual: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;