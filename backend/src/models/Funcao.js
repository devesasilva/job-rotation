const mongoose = require('mongoose');

const funcaoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    descricao: {
      type: String,
      trim: true,
    },

    organizacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizacao',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Funcao =
  mongoose.models.Funcao ||
  mongoose.model('Funcao', funcaoSchema);

module.exports = Funcao;