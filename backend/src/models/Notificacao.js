const mongoose = require('mongoose');

const notificacaoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    organizacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizacao',
      required: true,
      index: true,
    },
    rodizio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rodizio',
      required: true,
    },
    eventId: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: [
        'ROTACAO_AGENDADA',
        'ROTACAO_CONCLUIDA',
      ],
      required: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    mensagem: {
      type: String,
      required: true,
      trim: true,
    },
    lida: {
      type: Boolean,
      default: false,
    },
    lidaEm: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificacaoSchema.index(
  { usuario: 1, createdAt: -1 }
);
notificacaoSchema.index(
  { usuario: 1, lida: 1, createdAt: -1 }
);
notificacaoSchema.index(
  { usuario: 1, eventId: 1 },
  { unique: true }
);

const Notificacao =
  mongoose.models.Notificacao ||
  mongoose.model('Notificacao', notificacaoSchema);

module.exports = Notificacao;
