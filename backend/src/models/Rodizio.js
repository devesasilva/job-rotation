
const mongoose = require('mongoose');

const atribuicaoSchema = new mongoose.Schema(
  {
    membro: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembroOrganizacao',
      default: null,
    },
    funcao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Funcao',
      default: null,
    },
  }
);

const rodizioSchema = new mongoose.Schema(
  {
    organizacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizacao',
      required: true,
      index: true,
    },

    membros: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembroOrganizacao',
      },
    ],

    funcoes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funcao',
      },
    ],

    atribuicoes: [atribuicaoSchema],

    ciclo: {
      type: String,
      enum: [
        'Diário',
        'Semanal',
        'Quinzenal',
        'Mensal',
        'Anual',
      ],
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
  dataInicio: 1,
  dataFim: 1,
});

const Rodizio =
  mongoose.models.Rodizio ||
  mongoose.model('Rodizio', rodizioSchema);

module.exports = Rodizio;