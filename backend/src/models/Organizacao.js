const mongoose = require('mongoose');

const organizacaoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Organizacao =
  mongoose.models.Organizacao ||
  mongoose.model('Organizacao', organizacaoSchema);

module.exports = Organizacao;