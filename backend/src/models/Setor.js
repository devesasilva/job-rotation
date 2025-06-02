const mongoose = require('mongoose');

const setorSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  equipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipe',
    required: true,
  },
  descricao: String,
}, { timestamps: true });

const Setor = mongoose.model('Setor', setorSchema);

module.exports = Setor;