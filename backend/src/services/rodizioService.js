const mongoose = require('mongoose');

const Rodizio = require('../models/Rodizio');
const MembroOrganizacao = require('../models/MembroOrganizacao');
const Funcao = require('../models/Funcao');

const {
  validarAdminOuModerador,
  validarMembro,
} = require('./organizacaoService');

const CICLOS_PERMITIDOS = [
  'Diário',
  'Semanal',
  'Quinzenal',
  'Mensal',
  'Anual',
];

const validarObjectId = (id, campo) => {
  if (!mongoose.isValidObjectId(id)) {
    const erro = new Error(`${campo} inválido.`);
    erro.status = 400;
    throw erro;
  }
};

const validarPeriodo = (dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  if (
    Number.isNaN(inicio.getTime()) ||
    Number.isNaN(fim.getTime())
  ) {
    const erro = new Error(
      'Data de início ou término inválida.'
    );
    erro.status = 400;
    throw erro;
  }

  if (inicio >= fim) {
    const erro = new Error(
      'A data de início deve ser anterior à data de término.'
    );
    erro.status = 400;
    throw erro;
  }

  return { inicio, fim };
};

// Centraliza o carregamento dos dados relacionados.
const popularRodizio = (consulta) => {
  return consulta
    .populate({
      path: 'membros',
      populate: {
        path: 'usuario',
        select: 'nome email',
      },
    })
    .populate('funcoes', 'nome descricao');
};

// Cria um rodízio sem exigir membros ou funções.
const criarRodizio = async (
  organizacaoId,
  usuarioId,
  dados
) => {
  validarObjectId(
    organizacaoId,
    'ID da organização'
  );

  await validarAdminOuModerador(
    organizacaoId,
    usuarioId
  );

  const ciclo = dados.ciclo || 'Mensal';

  if (!CICLOS_PERMITIDOS.includes(ciclo)) {
    const erro = new Error(
      'Ciclo inválido. Os valores permitidos são: Diário, Semanal, Quinzenal, Mensal ou Anual.'
    );
    erro.status = 400;
    throw erro;
  }

  const { inicio, fim } = validarPeriodo(
    dados.dataInicio,
    dados.dataFim
  );

  const rodizio = await Rodizio.create({
    organizacao: organizacaoId,
    membros: [],
    funcoes: [],
    ciclo,
    dataInicio: inicio,
    dataFim: fim,
  });

  return buscarRodizioPorId(
    rodizio._id,
    organizacaoId,
    usuarioId
  );
};

// Lista todos os rodízios da organização.
const listarRodizios = async (
  organizacaoId,
  usuarioId
) => {
  validarObjectId(
    organizacaoId,
    'ID da organização'
  );

  await validarAdminOuModerador(
    organizacaoId,
    usuarioId
  );

  return popularRodizio(
    Rodizio.find({
      organizacao: organizacaoId,
    }).sort({
      dataInicio: 1,
    })
  );
};

// Busca um rodízio específico.
const buscarRodizioPorId = async (
  rodizioId,
  organizacaoId,
  usuarioId
) => {
  validarObjectId(
    rodizioId,
    'ID do rodízio'
  );

  validarObjectId(
    organizacaoId,
    'ID da organização'
  );

  await validarMembro(
    organizacaoId,
    usuarioId
  );

  const rodizio = await popularRodizio(
    Rodizio.findOne({
      _id: rodizioId,
      organizacao: organizacaoId,
    })
  );

  if (!rodizio) {
    const erro = new Error(
      'Rodízio não encontrado nesta organização.'
    );
    erro.status = 404;
    throw erro;
  }

  return rodizio;
};

// Lista os rodízios ativos dos quais o usuário participa.
const listarMinhaRotacaoAtual = async (
  organizacaoId,
  usuarioId
) => {
  validarObjectId(
    organizacaoId,
    'ID da organização'
  );

  const membro = await validarMembro(
    organizacaoId,
    usuarioId
  );

  const agora = new Date();

  return popularRodizio(
    Rodizio.find({
      organizacao: organizacaoId,
      membros: membro._id,
      dataInicio: { $lte: agora },
      dataFim: { $gte: agora },
    }).sort({
      dataInicio: 1,
    })
  );
};


const obterRodizioParaAlteracao = async (
  organizacaoId,
  rodizioId,
  usuarioId
) => {
  validarObjectId(organizacaoId, 'ID da organização');
  validarObjectId(rodizioId, 'ID do rodízio');

  await validarAdminOuModerador(
    organizacaoId,
    usuarioId
  );

  const rodizio = await Rodizio.findOne({
    _id: rodizioId,
    organizacao: organizacaoId,
  });

  if (!rodizio) {
    const erro = new Error(
      'Rodízio não encontrado nesta organização.'
    );
    erro.status = 404;
    throw erro;
  }

  return rodizio;
};

const adicionarMembro = async (
  organizacaoId,
  rodizioId,
  membroId,
  usuarioId
) => {
  validarObjectId(membroId, 'ID do membro');

  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  const membro = await MembroOrganizacao.findOne({
    _id: membroId,
    organizacao: organizacaoId,
  });

  if (!membro) {
    const erro = new Error(
      'Membro não pertence a esta organização.'
    );
    erro.status = 404;
    throw erro;
  }

  const jaExiste = rodizio.membros.some(
    id => id.equals(membro._id)
  );

  if (jaExiste) {
    const erro = new Error(
      'Membro já está associado a este rodízio.'
    );
    erro.status = 409;
    throw erro;
  }

  rodizio.membros.push(membro._id);
  await rodizio.save();

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

const removerMembro = async (
  organizacaoId,
  rodizioId,
  membroId,
  usuarioId
) => {
  validarObjectId(membroId, 'ID do membro');

  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  const indice = rodizio.membros.findIndex(
    id => id.equals(membroId)
  );

  if (indice === -1) {
    const erro = new Error(
      'Membro não está associado a este rodízio.'
    );
    erro.status = 404;
    throw erro;
  }

  rodizio.membros.splice(indice, 1);
  await rodizio.save();

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

const adicionarFuncao = async (
  organizacaoId,
  rodizioId,
  funcaoId,
  usuarioId
) => {
  validarObjectId(funcaoId, 'ID da função');

  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  const funcao = await Funcao.findOne({
    _id: funcaoId,
    organizacao: organizacaoId,
  });

  if (!funcao) {
    const erro = new Error(
      'Função não pertence a esta organização.'
    );
    erro.status = 404;
    throw erro;
  }

  const jaExiste = rodizio.funcoes.some(
    id => id.equals(funcao._id)
  );

  if (jaExiste) {
    const erro = new Error(
      'Função já está associada a este rodízio.'
    );
    erro.status = 409;
    throw erro;
  }

  rodizio.funcoes.push(funcao._id);
  await rodizio.save();

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

const removerFuncao = async (
  organizacaoId,
  rodizioId,
  funcaoId,
  usuarioId
) => {
  validarObjectId(funcaoId, 'ID da função');

  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  const indice = rodizio.funcoes.findIndex(
    id => id.equals(funcaoId)
  );

  if (indice === -1) {
    const erro = new Error(
      'Função não está associada a este rodízio.'
    );
    erro.status = 404;
    throw erro;
  }

  rodizio.funcoes.splice(indice, 1);
  await rodizio.save();

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

module.exports = {
  criarRodizio,
  listarRodizios,
  buscarRodizioPorId,
  listarMinhaRotacaoAtual,
  adicionarMembro,
  removerMembro,
  adicionarFuncao,
  removerFuncao,
};