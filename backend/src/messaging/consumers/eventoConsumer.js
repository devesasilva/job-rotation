
const {
  conectarRabbitMQ,
  obterFila,
} = require('../../../config/rabbitmq');

const {
  processarEvento,
} = require('../handlers/rotacaoEventHandler');

const iniciarConsumer = async () => {
  const channel = await conectarRabbitMQ();
  const queue = obterFila();

  // Processa uma mensagem por vez.
  channel.prefetch(1);

  await channel.consume(
    queue,
    async (mensagem) => {
      if (!mensagem) {
        return;
      }

      let evento;

      try {
        evento = JSON.parse(
          mensagem.content.toString()
        );

        console.log(
          '[Consumer] Evento recebido:',
          evento.eventType
        );

        await processarEvento(evento);

        // Confirma que a mensagem foi processada.
        channel.ack(mensagem);

      } catch (error) {
        console.error(
          '[Consumer] Falha ao processar evento:',
          {
            eventId: evento?.eventId,
            eventType: evento?.eventType,
            erro: error.message,
          }
        );

        // Solicita que a mensagem seja reenviada.
        channel.nack(mensagem, false, true);
      }
    },
    {
      noAck: false,
    }
  );

  console.log(
    `[Consumer] Aguardando mensagens na fila ${queue}`
  );
};

module.exports = {
  iniciarConsumer,
};
