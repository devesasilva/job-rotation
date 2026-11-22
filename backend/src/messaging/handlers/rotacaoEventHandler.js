const {
  criarNotificacoesDoEvento,
} = require('../../services/notificacaoService');
const processarEvento = async (evento) => {
  console.log(
    '[EventHandler] Iniciando processamento:',
    {
      eventId: evento.eventId,
      eventType: evento.eventType,
    }
  );

  switch (evento.eventType) {
    case 'ROTACAO_AGENDADA':
      await processarRotacaoAgendada(evento);
      break;

    case 'ROTACAO_CONCLUIDA':
      await processarRotacaoConcluida(evento);
      break;

    default:
      throw new Error(
        `Tipo de evento desconhecido: ${evento.eventType}`
      );
  }

  console.log(
    '[EventHandler] Processamento concluído:',
    evento.eventId
  );
};

const processarRotacaoAgendada = async (evento) => {
  const { rodizioId, organizacaoId } = evento.data;

  console.log(
    '[RotacaoAgendada] Nova rotação agendada:',
    {
      rodizioId,
      organizacaoId,
      dataInicio: evento.data.dataInicio,
      dataFim: evento.data.dataFim,
    }
  );
  await criarNotificacoesDoEvento(evento);
};

const processarRotacaoConcluida = async (evento) => {
  const { rodizioId, organizacaoId } = evento.data;

  console.log(
    '[RotacaoConcluida] Rotação concluída:',
    {
      rodizioId,
      organizacaoId,
    }
  );
  await criarNotificacoesDoEvento(evento);
};

module.exports = {
  processarEvento,
};
