const Funcao = require('../models/Funcao');

const {
  validarAdminOuModerador,
  validarMembro,
} = require('./organizacaoService');

const criarFuncao = async (
  organizacaoId,
  usuarioId,
  dados
) => {
  await validarAdminOuModerador(
    organizacaoId,
    usuarioId
  );

  if (!dados.nome || !dados.nome.trim()) {
    const erro = new Error(
      'O nome da função é obrigatório.'
    );

    erro.status = 400;
    throw erro;
  }

  const funcao = new Funcao({
    nome: dados.nome.trim(),
    descricao: dados.descricao?.trim() || undefined,
    organizacao: organizacaoId,
  });

  return await funcao.save();
};

const listarFuncoes = async (
  organizacaoId,
  usuarioId
) => {
  await validarMembro(
    organizacaoId,
    usuarioId
  );

  return await Funcao.find({
    organizacao: organizacaoId,
  }).sort({ nome: 1 });
};

module.exports = {
  criarFuncao,
  listarFuncoes,
};