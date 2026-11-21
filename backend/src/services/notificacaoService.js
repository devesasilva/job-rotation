const mongoose = require('mongoose');
const Notificacao = require('../models/Notificacao');
const MembroOrganizacao = require('../models/MembroOrganizacao');

const clientesSse = new Map();

const formatarData = (valor) => {
  if (!valor) {
    return null;
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data.toLocaleDateString('pt-BR');
};

const formatarMensagem = (evento) => {
  const tipo = evento.eventType;
  const data = evento.data || {};
  const inicio = formatarData(data.dataInicio);
  const fim = formatarData(data.dataFim);
  const ciclo = data.ciclo ? ` ${data.ciclo.toLowerCase()}` : '';

  if (tipo === 'ROTACAO_AGENDADA') {
    const titulo = 'Rotação agendada';
    const periodo = inicio && fim
      ? `Período: ${inicio} a ${fim}.`
      : '';

    return {
      titulo,
      mensagem: inicio
        ? `Uma nova rotação${ciclo} foi agendada para ${inicio}. ${periodo}`.trim()
        : `Uma nova rotação${ciclo} foi agendada. ${periodo}`.trim(),
    };
  }

  if (tipo === 'ROTACAO_CONCLUIDA') {
    const titulo = 'Rotação concluída';
    const periodo = inicio && fim
      ? `Período concluído: ${inicio} a ${fim}.`
      : '';

    return {
      titulo,
      mensagem: inicio
        ? `A rotação agendada para ${inicio} foi concluída. ${periodo}`.trim()
        : `Uma rotação${ciclo} foi concluída. ${periodo}`.trim(),
    };
  }

  throw new Error(`Tipo de evento desconhecido: ${tipo}`);
};

const registrarClienteSse = (usuarioId, resposta) => {
  const chave = usuarioId.toString();

  if (!clientesSse.has(chave)) {
    clientesSse.set(chave, new Set());
  }

  clientesSse.get(chave).add(resposta);

  return () => {
    const clientes = clientesSse.get(chave);

    if (!clientes) {
      return;
    }

    clientes.delete(resposta);

    if (clientes.size === 0) {
      clientesSse.delete(chave);
    }
  };
};

const notificarClientesSse = (usuarioId, dados) => {
  const clientes = clientesSse.get(usuarioId.toString());

  if (!clientes) {
    return;
  }

  const payload = `event: notificacao\ndata: ${JSON.stringify(dados)}\n\n`;

  for (const resposta of clientes) {
    if (!resposta.destroyed) {
      resposta.write(payload);
    }
  }
};

const criarNotificacoesDoEvento = async (evento) => {
  const organizacaoId = evento?.data?.organizacaoId;
  const rodizioId = evento?.data?.rodizioId;

  if (!evento?.eventId) {
    throw new Error('eventId é obrigatório.');
  }

  if (
    !mongoose.isValidObjectId(organizacaoId) ||
    !mongoose.isValidObjectId(rodizioId)
  ) {
    throw new Error('Evento de rotação contém identificadores inválidos.');
  }

  const membros = await MembroOrganizacao.find({
    organizacao: organizacaoId,
  }).select('usuario');

  const texto = formatarMensagem(evento);
  const criadas = [];

  for (const membro of membros) {
    try {
      const notificacao = await Notificacao.findOneAndUpdate(
        {
          usuario: membro.usuario,
          eventId: evento.eventId,
        },
        {
          $setOnInsert: {
            usuario: membro.usuario,
            organizacao: organizacaoId,
            rodizio: rodizioId,
            eventId: evento.eventId,
            tipo: evento.eventType,
            titulo: texto.titulo,
            mensagem: texto.mensagem,
            lida: false,
            lidaEm: null,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      criadas.push(notificacao);
      notificarClientesSse(membro.usuario, {
        eventId: evento.eventId,
        notificacaoId: notificacao._id.toString(),
      });
    } catch (error) {
      if (error?.code !== 11000) {
        console.error(
          '[NotificacaoService] Falha ao persistir notificação:',
          {
            usuarioId: membro.usuario?.toString(),
            eventId: evento.eventId,
            erro: error.message,
          }
        );
      }
    }
  }

  return criadas;
};

const listarNotificacoes = async (
  usuarioId,
  { pagina = 1, limite = 20, naoLidas = false } = {}
) => {
  const paginaSegura = Math.max(1, Number(pagina) || 1);
  const limiteSeguro = Math.min(
    100,
    Math.max(1, Number(limite) || 20)
  );
  const filtro = { usuario: usuarioId };

  if (naoLidas) {
    filtro.lida = false;
  }

  const [itens, total, naoLidasTotal] = await Promise.all([
    Notificacao.find(filtro)
      .sort({ createdAt: -1 })
      .skip((paginaSegura - 1) * limiteSeguro)
      .limit(limiteSeguro)
      .select(
        '_id tipo titulo mensagem organizacao rodizio lida lidaEm createdAt'
      )
      .lean(),
    Notificacao.countDocuments(filtro),
    Notificacao.countDocuments({
      usuario: usuarioId,
      lida: false,
    }),
  ]);

  return {
    itens: itens.map((item) => ({
      ...item,
      organizacaoId: item.organizacao,
      rodizioId: item.rodizio,
    })),
    naoLidas: naoLidasTotal,
    pagina: paginaSegura,
    totalPaginas: Math.ceil(total / limiteSeguro),
  };
};

const contarNaoLidas = (usuarioId) =>
  Notificacao.countDocuments({
    usuario: usuarioId,
    lida: false,
  });

const marcarComoLida = async (usuarioId, notificacaoId) => {
  if (!mongoose.isValidObjectId(notificacaoId)) {
    const erro = new Error('ID da notificação inválido.');
    erro.status = 400;
    throw erro;
  }

  const notificacao = await Notificacao.findOneAndUpdate(
    {
      _id: notificacaoId,
      usuario: usuarioId,
    },
    {
      $set: {
        lida: true,
        lidaEm: new Date(),
      },
    },
    { new: true }
  );

  if (!notificacao) {
    const erro = new Error(
      'Notificação não encontrada.'
    );
    erro.status = 404;
    throw erro;
  }

  return notificacao;
};

const marcarTodasComoLidas = async (usuarioId) => {
  const resultado = await Notificacao.updateMany(
    {
      usuario: usuarioId,
      lida: false,
    },
    {
      $set: {
        lida: true,
        lidaEm: new Date(),
      },
    }
  );

  return resultado.modifiedCount || 0;
};

const limparNotificacoes = async (usuarioId) => {
  const resultado = await Notificacao.deleteMany({
    usuario: usuarioId,
  });

  return resultado.deletedCount || 0;
};

module.exports = {
  criarNotificacoesDoEvento,
  listarNotificacoes,
  contarNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas,
  limparNotificacoes,
  registrarClienteSse,
};
