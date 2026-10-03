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

const editarFuncao = async (
  organizacaoId,
  usuarioId,
  funcaoId,
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

  const funcao = await Funcao.findOne({
    _id: funcaoId,
    organizacao: organizacaoId,
  });

  if (!funcao) {
    const erro = new Error(
      'Função não encontrada.'
    );

    erro.status = 404;
    throw erro;
  }

  funcao.nome = dados.nome.trim();
  funcao.descricao =
    dados.descricao?.trim() || undefined;

  return await funcao.save();
};

const excluirFuncao = async (
  organizacaoId,
  usuarioId,
  funcaoId
) => {
  await validarAdminOuModerador(
    organizacaoId,
    usuarioId
  );

  const funcao = await Funcao.findOne({
    _id: funcaoId,
    organizacao: organizacaoId,
  });

  if (!funcao) {
    const erro = new Error(
      'Função não encontrada.'
    );

    erro.status = 404;
    throw erro;
  }

  await Funcao.deleteOne({
    _id: funcaoId,
    organizacao: organizacaoId,
  });
};

module.exports = {
  criarFuncao,
  listarFuncoes,
  editarFuncao,
  excluirFuncao,
};