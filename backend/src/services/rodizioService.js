const mongoose = require('mongoose');

const Rodizio = require('../models/Rodizio');
const MembroOrganizacao = require('../models/MembroOrganizacao');
const Funcao = require('../models/Funcao');

const {
  validarAdminOuGestor,
  validarMembro,
} = require('./organizacaoService');

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

  return {
    inicio,
    fim,
  };
};

  const CICLOS_PERMITIDOS = [
  'Diário',
  'Semanal',
  'Quinzenal',
  'Mensal',
  'Anual',
];

const agendarRodizio = async (
  organizacaoId,
  usuarioId,
  dados
) => {
  validarObjectId(
    organizacaoId,
    'ID da organização'
  );

  validarObjectId(
    dados.participante,
    'ID do participante'
  );

  await validarAdminOuGestor(
    organizacaoId,
    usuarioId
  );

  const participante = await MembroOrganizacao.findOne({
    _id: dados.participante,
    organizacao: organizacaoId,
  });

  if (!participante) {
    const erro = new Error(
      'Participante não pertence a esta organização.'
    );

    erro.status = 400;

    throw erro;
  }

  // Função é obrigatória
  if (!dados.funcao) {
    const erro = new Error(
      'A função é obrigatória para a rotação.'
    );

    erro.status = 400;

    throw erro;
  }

  validarObjectId(
    dados.funcao,
    'ID da função'
  );

  const funcao = await Funcao.findOne({
    _id: dados.funcao,
    organizacao: organizacaoId,
  });

  if (!funcao) {
    const erro = new Error(
      'Função não pertence a esta organização.'
    );

    erro.status = 400;

    throw erro;
  }

  // Validação do ciclo
  const ciclo = dados.ciclo || 'Mensal';

  if (!CICLOS_PERMITIDOS.includes(ciclo)) {
    const erro = new Error(
      'Ciclo inválido. Os valores permitidos são: Diário, Semanal, Quinzenal, Mensal ou Anual.'
    );

    erro.status = 400;

    throw erro;
  }

  // Validação do período
  const { inicio, fim } = validarPeriodo(
    dados.dataInicio,
    dados.dataFim
  );

  // Evita duas rotações simultâneas
  const conflito = await Rodizio.findOne({
    organizacao: organizacaoId,
    participante: participante._id,
    dataInicio: {
      $lt: fim,
    },
    dataFim: {
      $gt: inicio,
    },
  });

  if (conflito) {
    const erro = new Error(
      'O participante já possui uma rotação neste período.'
    );

    erro.status = 409;

    throw erro;
  }

  const rodizio = await Rodizio.create({
    organizacao: organizacaoId,
    participante: participante._id,
    funcao: dados.funcao,
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

const listarRodizios = async (
  organizacaoId,
  usuarioId
) => {
  await validarAdminOuGestor(
    organizacaoId,
    usuarioId
  );

  return Rodizio.find({
    organizacao: organizacaoId,
  })
    .populate({
      path: 'participante',
      populate: {
        path: 'usuario',
        select: 'nome email',
      },
    })
    .populate(
      'funcao',
      'nome descricao'
    )
    .sort({
      dataInicio: 1,
    });
};

const buscarRodizioPorId = async (
  rodizioId,
  organizacaoId,
  usuarioId
) => {
  validarObjectId(
    rodizioId,
    'ID do rodízio'
  );

  await validarMembro(
    organizacaoId,
    usuarioId
  );

  const rodizio = await Rodizio.findOne({
    _id: rodizioId,
    organizacao: organizacaoId,
  })
    .populate({
      path: 'participante',
      populate: {
        path: 'usuario',
        select: 'nome email',
      },
    })
    .populate(
      'funcao',
      'nome descricao'
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

const listarMinhaRotacaoAtual = async (
  organizacaoId,
  usuarioId
) => {
  const membro = await validarMembro(
    organizacaoId,
    usuarioId
  );

  const agora = new Date();

  return Rodizio.find({
    organizacao: organizacaoId,
    participante: membro._id,

    dataInicio: {
      $lte: agora,
    },

    dataFim: {
      $gte: agora,
    },
  })
    .populate(
      'funcao',
      'nome descricao'
    )
    .sort({
      dataInicio: 1,
    });
};

module.exports = {
  agendarRodizio,
  listarRodizios,
  buscarRodizioPorId,
  listarMinhaRotacaoAtual,
};