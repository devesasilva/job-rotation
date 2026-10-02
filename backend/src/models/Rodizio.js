const mongoose = require('mongoose');

const rodizioSchema = new mongoose.Schema(
  {
    organizacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizacao',
      required: true,
      index: true,
    },

    participante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembroOrganizacao',
      required: true,
      index: true,
    },

    funcao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Funcao',
    },

    ciclo: {
      type: String,
      enum: ['Diário', 'Semanal', 'Quinzenal', 'Mensal', 'Anual'],
      default: 'Mensal',
    },

    dataInicio: {
      type: Date,
      required: true,
      index: true,
    },

    dataFim: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

rodizioSchema.index({
  organizacao: 1,
  participante: 1,
  dataInicio: 1,
  dataFim: 1,
});

const Rodizio =
  mongoose.models.Rodizio ||
  mongoose.model('Rodizio', rodizioSchema);

module.exports = Rodizio;