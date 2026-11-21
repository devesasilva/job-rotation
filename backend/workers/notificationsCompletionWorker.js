require('dotenv').config();

const ConexaoDB = require('../config/db');
const Rodizio = require('../src/models/Rodizio');
const {
  publicarEvento,
} = require('../src/messaging/publishers/eventoPublisher');

const intervaloMs =
  Number(process.env.NOTIFICATION_COMPLETION_INTERVAL_MS) ||
  60000;

const iniciar = async () => {
  await ConexaoDB();
  await processarRodiziosConcluidos();
};

const processarRodiziosConcluidos = async () => {
  const agora = new Date();

  try {
    const rodizios = await Rodizio.find({
      dataFim: { $lte: agora },
      concluidoEm: null,
    }).limit(100);

    for (const rodizio of rodizios) {
      try {
        const dataFim =
          rodizio.dataFim.toISOString();
        const eventId =
          `${rodizio._id}:ROTACAO_CONCLUIDA:${dataFim}`;

        await publicarEvento({
          eventId,
          eventType: 'ROTACAO_CONCLUIDA',
          occurredAt: agora.toISOString(),
          data: {
            rodizioId: rodizio._id.toString(),
            organizacaoId:
              rodizio.organizacao.toString(),
            ciclo: rodizio.ciclo,
            dataInicio:
              rodizio.dataInicio.toISOString(),
            dataFim,
          },
        });

        await Rodizio.updateOne(
          {
            _id: rodizio._id,
            concluidoEm: null,
          },
          {
            $set: {
              concluidoEm: agora,
            },
          }
        );
      } catch (error) {
        console.error(
          '[CompletionWorker] Falha ao concluir rodízio:',
          {
            rodizioId: rodizio._id.toString(),
            erro: error.message,
          }
        );
      }
    }
  } catch (error) {
    console.error(
      '[CompletionWorker] Falha na busca de rodízios:',
      error.message
    );
  }
};

console.log(
  `[CompletionWorker] Verificando rodízios concluídos a cada ${intervaloMs} ms`
);

const intervalo = setInterval(
  processarRodiziosConcluidos,
  intervaloMs
);

iniciar();

const encerrar = () => {
  clearInterval(intervalo);
  process.exit(0);
};

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
