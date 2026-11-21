const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
  blobName: { type: String, default: null },
  url: { type: String, default: null },          // URL canônica sem SAS
  contentType: { type: String, default: null },
  size: { type: Number, default: null },
  updatedAt: { type: Date, default: null }
}, { _id: false });

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
  avatar: {
    type: avatarSchema,
    default: null
  }
}, { timestamps: true });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
