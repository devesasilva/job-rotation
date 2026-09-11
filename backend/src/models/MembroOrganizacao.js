const mongoose = require('mongoose');

const membroOrganizacaoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },

    organizacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizacao',
      required: true,
    },

    perfil: {
      type: String,
      enum: ['ADMIN', 'GESTOR', 'PARTICIPANTE'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

membroOrganizacaoSchema.index(
  { usuario: 1, organizacao: 1 },
  { unique: true }
);

const MembroOrganizacao =
  mongoose.models.MembroOrganizacao ||
  mongoose.model('MembroOrganizacao', membroOrganizacaoSchema);

module.exports = MembroOrganizacao;