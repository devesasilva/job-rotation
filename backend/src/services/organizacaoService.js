const mongoose = require('mongoose');
const Organizacao = require('../models/Organizacao');
const MembroOrganizacao = require('../models/MembroOrganizacao');
const Usuario = require('../models/Usuario');

const criarOrganizacao = async (nome, usuarioId) => {
  const session = await mongoose.startSession();

  try {
    let organizacaoCriada;

    await session.withTransaction(async () => {
      const [organizacao] = await Organizacao.create(
        [
          {
            nome,
          },
        ],
        { session }
      );

      await MembroOrganizacao.create(
        [
          {
            usuario: usuarioId,
            organizacao: organizacao._id,
            perfil: 'ADMIN',
          },
        ],
        { session }
      );

      organizacaoCriada = organizacao;
    });

    return organizacaoCriada;
  } finally {
    await session.endSession();
  }
};

const buscarOrganizacaoPorId = async (organizacaoId, usuarioId) => {
  const membro = await MembroOrganizacao.findOne({
    usuario: usuarioId,
    organizacao: organizacaoId,
  });

  if (!membro) {
    const erro = new Error(
      'Usuário não possui acesso a esta organização.'
    );

    erro.status = 403;

    throw erro;
  }

  return Organizacao.findById(organizacaoId);
};

const validarAdmin = async (organizacaoId, usuarioId) => {
  const membro = await MembroOrganizacao.findOne({
    usuario: usuarioId,
    organizacao: organizacaoId,
  });

  if (!membro || membro.perfil !== 'ADMIN') {
    const erro = new Error(
      'Usuário não possui permissão de administrador nesta organização.'
    );
    erro.status = 403;
    throw erro;
  }
};

const adicionarMembro = async (organizacaoId, usuarioId, emailMembro, perfil) => {
  await validarAdmin(organizacaoId, usuarioId);

  const usuarioValido = await Usuario.findOne({ email: emailMembro });

  if (!usuarioValido) {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    throw erro;
  }

  const membroExistente = await MembroOrganizacao.findOne({
    organizacao: organizacaoId,
    usuario: usuarioValido._id,
  });

  if (membroExistente) {
    const erro = new Error('Usuário já é membro desta organização.');
    erro.status = 400;
    throw erro;
  }

  const novoMembro = new MembroOrganizacao({
    organizacao: organizacaoId,
    usuario: usuarioValido._id,
    perfil,
  });

  await novoMembro.save();
  return novoMembro;
};

const listarMembros = async (organizacaoId, usuarioId) => {
  await validarAdmin(organizacaoId, usuarioId);

  return await MembroOrganizacao.find({ organizacao: organizacaoId })
  .populate('usuario', 'nome email')
  .exec();
};

const editarMembro = async (organizacaoId, usuarioId, membroId, novoPerfil) => {
  await validarAdmin(organizacaoId, usuarioId);

  const membro = await MembroOrganizacao.findOne({
    _id: membroId,
    organizacao: organizacaoId,
  });

  if (!membro) {
    const erro = new Error('Membro não encontrado nesta organização.');
    erro.status = 404;
    throw erro;
  }

  membro.perfil = novoPerfil;

  await membro.save();

  return membro;
};

const removerMembro = async (organizacaoId, usuarioId, membroId) => {
  await validarAdmin(organizacaoId, usuarioId);

  const membro = await MembroOrganizacao.findOne({
    _id: membroId,
    organizacao: organizacaoId,
  });

  if (!membro) {
    const erro = new Error('Membro não encontrado nesta organização.');
    erro.status = 404;
    throw erro;
  }

  await membro.deleteOne();
  return membro;
};

module.exports = {
  criarOrganizacao,
  buscarOrganizacaoPorId,
  adicionarMembro,
  listarMembros,
  editarMembro,
  removerMembro,
};