const mongoose = require('mongoose');

const equipeSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  membros: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    perfil: {
      type: String,
      enum: ['admin', 'mentor', 'colaborador'], 
      default: 'colaborador',
      required: true,
    },
  }],
}, { timestamps: true });

const Equipe = mongoose.model('Equipe', equipeSchema);

module.exports = Equipe;