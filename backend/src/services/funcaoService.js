const Funcao = require('../models/Funcao');
const { validarAdmin } = require('./organizacaoService');

const criarFuncao = async (
  organizacaoId,
  usuarioId,
  dados
) => {
  await validarAdmin(organizacaoId, usuarioId);

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
  await validarAdmin(organizacaoId, usuarioId);

  return await Funcao.find({
    organizacao: organizacaoId,
  }).sort({ nome: 1 });
};

module.exports = {
  criarFuncao,
  listarFuncoes,
};