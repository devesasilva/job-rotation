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

const obterIdReferencia = valor =>
  valor?._id || valor || null;

const popularRodizio = async (
  consulta,
  persistirAtribuicoesLegadas = false
) => {
  const resultado = await consulta
    .populate({
      path: 'membros',
      populate: {
        path: 'usuario',
        select: 'nome email',
      },
    })
    .populate('funcoes', 'nome descricao')
    .populate({
      path: 'atribuicoes.membro',
      populate: {
        path: 'usuario',
        select: 'nome email',
      },
    })
    .populate('atribuicoes.funcao', 'nome descricao');

  const serializarRodizio = async rodizio => {
    if (
      rodizio.atribuicoes.length === 0 &&
      (rodizio.membros.length > 0 ||
        rodizio.funcoes.length > 0)
    ) {
      if (persistirAtribuicoesLegadas) {
        materializarAtribuicoesLegadas(rodizio);
        await rodizio.save();
        await rodizio.populate({
          path: 'atribuicoes.membro',
          populate: {
            path: 'usuario',
            select: 'nome email',
          },
        });
        await rodizio.populate(
          'atribuicoes.funcao',
          'nome descricao'
        );
      } else {
        const dados = rodizio.toObject();
        dados.atribuicoes = [
          ...dados.membros.map((membro, indice) => ({
            _id: `${rodizio._id}-membro-${indice}`,
            membro,
            funcao: null,
          })),
          ...dados.funcoes.map((funcao, indice) => ({
            _id: `${rodizio._id}-funcao-${indice}`,
            membro: null,
            funcao,
          })),
        ];

        return dados;
      }
    }

    return rodizio.toObject();
  };

  return Array.isArray(resultado)
    ? Promise.all(resultado.map(serializarRodizio))
    : resultado && serializarRodizio(resultado);
};

const materializarAtribuicoesLegadas = rodizio => {
  if (rodizio.atribuicoes.length > 0) {
    return;
  }

  rodizio.atribuicoes = [
    ...rodizio.membros.map(membro => ({
      membro: obterIdReferencia(membro),
      funcao: null,
    })),
    ...rodizio.funcoes.map(funcao => ({
      membro: null,
      funcao: obterIdReferencia(funcao),
    })),
  ];
};

const sincronizarAssociacoesLegadas = rodizio => {
  const membros = new Map();
  const funcoes = new Map();

  rodizio.atribuicoes.forEach(atribuicao => {
    const membroId = obterIdReferencia(
      atribuicao.membro
    );
    const funcaoId = obterIdReferencia(
      atribuicao.funcao
    );

    if (membroId) {
      membros.set(
        membroId.toString(),
        membroId
      );
    }

    if (funcaoId) {
      funcoes.set(
        funcaoId.toString(),
        funcaoId
      );
    }
  });

  rodizio.membros = [...membros.values()];
  rodizio.funcoes = [...funcoes.values()];
};

const buscarMembroDaOrganizacao = async (
  membroId,
  organizacaoId
) => {
  if (!membroId) {
    return null;
  }

  validarObjectId(membroId, 'ID do membro');

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

  return membro;
};

const buscarFuncaoDaOrganizacao = async (
  funcaoId,
  organizacaoId
) => {
  if (!funcaoId) {
    return null;
  }

  validarObjectId(funcaoId, 'ID da função');

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

  return funcao;
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
    atribuicoes: [],
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

const atualizarRodizio = async (
  organizacaoId,
  rodizioId,
  dados,
  usuarioId
) => {
  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  if (
    !Object.prototype.hasOwnProperty.call(dados, 'ciclo') &&
    !Object.prototype.hasOwnProperty.call(
      dados,
      'dataInicio'
    ) &&
    !Object.prototype.hasOwnProperty.call(dados, 'dataFim')
  ) {
    const erro = new Error(
      'Informe o ciclo ou o período a atualizar.'
    );
    erro.status = 400;
    throw erro;
  }

  if (
    Object.prototype.hasOwnProperty.call(dados, 'ciclo')
  ) {
    if (!CICLOS_PERMITIDOS.includes(dados.ciclo)) {
      const erro = new Error(
        'Ciclo inválido. Os valores permitidos são: Diário, Semanal, Quinzenal, Mensal ou Anual.'
      );
      erro.status = 400;
      throw erro;
    }

    rodizio.ciclo = dados.ciclo;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      dados,
      'dataInicio'
    ) ||
    Object.prototype.hasOwnProperty.call(
      dados,
      'dataFim'
    )
  ) {
    const { inicio, fim } = validarPeriodo(
      dados.dataInicio || rodizio.dataInicio,
      dados.dataFim || rodizio.dataFim
    );
    rodizio.dataInicio = inicio;
    rodizio.dataFim = fim;
  }

  await rodizio.save();

  return popularRodizio(
    Rodizio.findOne({
      _id: rodizio._id,
      organizacao: organizacaoId,
    })
  );
};

const excluirRodizio = async (
  organizacaoId,
  rodizioId,
  usuarioId
) => {
  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  await rodizio.deleteOne();
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

  await validarMembro(
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
    }),
    true
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
      $or: [
        { 'atribuicoes.membro': membro._id },
        { membros: membro._id },
      ],
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

  materializarAtribuicoesLegadas(rodizio);

  const membro = await buscarMembroDaOrganizacao(
    membroId,
    organizacaoId
  );

  if (
    rodizio.atribuicoes.some(
      atribuicao =>
        atribuicao.membro?.equals(membro._id)
    )
  ) {
    const erro = new Error(
      'Membro já está associado a este rodízio.'
    );
    erro.status = 409;
    throw erro;
  }

  rodizio.atribuicoes.push({
    membro: membro._id,
    funcao: null,
  });
  sincronizarAssociacoesLegadas(rodizio);
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

  materializarAtribuicoesLegadas(rodizio);

  const atribuicoesMembro = rodizio.atribuicoes.filter(
    atribuicao => atribuicao.membro?.equals(membroId)
  );

  if (atribuicoesMembro.length === 0) {
    const erro = new Error(
      'Membro não está associado a este rodízio.'
    );
    erro.status = 404;
    throw erro;
  }

  rodizio.atribuicoes = rodizio.atribuicoes.filter(
    atribuicao => {
      if (!atribuicao.membro?.equals(membroId)) {
        return true;
      }

      atribuicao.membro = null;
      return Boolean(atribuicao.funcao);
    }
  );
  sincronizarAssociacoesLegadas(rodizio);
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

  materializarAtribuicoesLegadas(rodizio);

  const funcao = await buscarFuncaoDaOrganizacao(
    funcaoId,
    organizacaoId
  );

  if (
    rodizio.atribuicoes.some(
      atribuicao =>
        atribuicao.funcao?.equals(funcao._id)
    )
  ) {
    const erro = new Error(
      'Função já está associada a este rodízio.'
    );
    erro.status = 409;
    throw erro;
  }

  rodizio.atribuicoes.push({
    membro: null,
    funcao: funcao._id,
  });
  sincronizarAssociacoesLegadas(rodizio);
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

  materializarAtribuicoesLegadas(rodizio);

  const atribuicoesFuncao = rodizio.atribuicoes.filter(
    atribuicao => atribuicao.funcao?.equals(funcaoId)
  );

  if (atribuicoesFuncao.length === 0) {
    const erro = new Error(
      'Função não está associada a este rodízio.'
    );
    erro.status = 404;
    throw erro;
  }

  rodizio.atribuicoes = rodizio.atribuicoes.filter(
    atribuicao => {
      if (!atribuicao.funcao?.equals(funcaoId)) {
        return true;
      }

      atribuicao.funcao = null;
      return Boolean(atribuicao.membro);
    }
  );
  sincronizarAssociacoesLegadas(rodizio);
  await rodizio.save();

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

const adicionarAtribuicao = async (
  organizacaoId,
  rodizioId,
  dados,
  usuarioId
) => {
  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  materializarAtribuicoesLegadas(rodizio);

  const membro = await buscarMembroDaOrganizacao(
    dados.membroId,
    organizacaoId
  );
  const funcao = await buscarFuncaoDaOrganizacao(
    dados.funcaoId,
    organizacaoId
  );

  rodizio.atribuicoes.push({
    membro: membro?._id || null,
    funcao: funcao?._id || null,
  });
  sincronizarAssociacoesLegadas(rodizio);
  await rodizio.save();

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

const atualizarAtribuicao = async (
  organizacaoId,
  rodizioId,
  atribuicaoId,
  dados,
  usuarioId
) => {
  validarObjectId(atribuicaoId, 'ID da atribuição');

  if (
    !Object.prototype.hasOwnProperty.call(
      dados,
      'membroId'
    ) &&
    !Object.prototype.hasOwnProperty.call(
      dados,
      'funcaoId'
    )
  ) {
    const erro = new Error(
      'Informe o membro ou a função a atualizar.'
    );
    erro.status = 400;
    throw erro;
  }

  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  materializarAtribuicoesLegadas(rodizio);

  const atribuicao = rodizio.atribuicoes.id(
    atribuicaoId
  );

  if (!atribuicao) {
    const erro = new Error(
      'Linha não encontrada neste rodízio.'
    );
    erro.status = 404;
    throw erro;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      dados,
      'membroId'
    )
  ) {
    const membro = await buscarMembroDaOrganizacao(
      dados.membroId,
      organizacaoId
    );
    atribuicao.membro = membro?._id || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      dados,
      'funcaoId'
    )
  ) {
    const funcao = await buscarFuncaoDaOrganizacao(
      dados.funcaoId,
      organizacaoId
    );
    atribuicao.funcao = funcao?._id || null;
  }

  sincronizarAssociacoesLegadas(rodizio);
  await rodizio.save();

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

const removerAtribuicao = async (
  organizacaoId,
  rodizioId,
  atribuicaoId,
  usuarioId
) => {
  validarObjectId(atribuicaoId, 'ID da atribuição');

  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  materializarAtribuicoesLegadas(rodizio);

  const indice = rodizio.atribuicoes.findIndex(
    atribuicao => atribuicao._id.equals(atribuicaoId)
  );

  if (indice === -1) {
    const erro = new Error(
      'Linha não encontrada neste rodízio.'
    );
    erro.status = 404;
    throw erro;
  }

  rodizio.atribuicoes.splice(indice, 1);
  sincronizarAssociacoesLegadas(rodizio);
  await rodizio.save();

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

const rotacionarRodizio = async (
  organizacaoId,
  rodizioId,
  usuarioId
) => {
  const rodizio = await obterRodizioParaAlteracao(
    organizacaoId,
    rodizioId,
    usuarioId
  );

  const possuiAtribuicoes = rodizio.atribuicoes.length > 0;
  materializarAtribuicoesLegadas(rodizio);

  if (rodizio.atribuicoes.length < 2) {
    const erro = new Error(
      'Adicione pelo menos duas linhas ao rodízio antes de rotacioná-lo.'
    );
    erro.status = 400;
    throw erro;
  }

  if (!possuiAtribuicoes) {
    await rodizio.save();
  }

  const membros = rodizio.atribuicoes.map(atribuicao =>
    obterIdReferencia(atribuicao.membro)
  );
  const atualizacoes = {};

  rodizio.atribuicoes.forEach((_, indice) => {
    atualizacoes[`atribuicoes.${indice}.membro`] =
      membros[
        (indice - 1 + membros.length) % membros.length
      ];
  });

  const resultado = await Rodizio.updateOne(
    {
      _id: rodizio._id,
      organizacao: organizacaoId,
    },
    {
      $set: atualizacoes,
    }
  );

  if (!resultado.matchedCount) {
    const erro = new Error(
      'Rodízio não encontrado nesta organização.'
    );
    erro.status = 404;
    throw erro;
  }

  return popularRodizio(
    Rodizio.findById(rodizio._id)
  );
};

module.exports = {
  criarRodizio,
  atualizarRodizio,
  excluirRodizio,
  listarRodizios,
  buscarRodizioPorId,
  listarMinhaRotacaoAtual,
  adicionarMembro,
  removerMembro,
  adicionarFuncao,
  removerFuncao,
  adicionarAtribuicao,
  atualizarAtribuicao,
  removerAtribuicao,
  rotacionarRodizio,
};