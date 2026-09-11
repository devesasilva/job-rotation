const mongoose = require('mongoose');
const Organizacao = require('../models/Organizacao');
const MembroOrganizacao = require('../models/MembroOrganizacao');

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

module.exports = {
  criarOrganizacao,
  buscarOrganizacaoPorId,
};