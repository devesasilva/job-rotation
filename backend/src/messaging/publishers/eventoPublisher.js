const {
  conectarRabbitMQ,
  obterFila,
} = require('../../../config/rabbitmq');

const publicarEvento = async (evento) => {
  const channel = await conectarRabbitMQ();
  const queue = obterFila();

  const mensagem = Buffer.from(
    JSON.stringify(evento)
  );

  await new Promise((resolve, reject) => {
    channel.sendToQueue(
      queue,
      mensagem,
      {
        persistent: true,
        contentType: 'application/json',
        messageId: evento.eventId,
        timestamp: Date.now(),
      },
      (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      }
    );
  });

  console.log(
    `[Publisher] Evento publicado: ${evento.eventType}`,
    {
      eventId: evento.eventId,
      rodizioId: evento.data.rodizioId,
    }
  );
};

module.exports = {
  publicarEvento,
};
