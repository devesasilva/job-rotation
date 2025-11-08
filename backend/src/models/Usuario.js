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
    required: false,
  },
  habilidades: [{
    type: String,
    required: false,
  }],
  dataInicialCargoAtual: {
    type: Date,
    required: false,
  },
}, { timestamps: true });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;