const amqp = require('amqplib');

const QUEUE =
  process.env.RABBITMQ_QUEUE || 'job-rotation.events';

let connection = null;
let channel = null;

const conectarRabbitMQ = async () => {
  if (channel) {
    return channel;
  }

  try {
    connection = await amqp.connect(
      process.env.RABBITMQ_URL
    );

    connection.on('error', (error) => {
      console.error(
        '[RabbitMQ] Erro na conexão:',
        error.message
      );

      connection = null;
      channel = null;
    });

    connection.on('close', () => {
      console.warn(
        '[RabbitMQ] Conexão encerrada.'
      );

      connection = null;
      channel = null;
    });

    channel = await connection.createConfirmChannel();

    await channel.assertQueue(QUEUE, {
      durable: true,
    });

    console.log(
      `[RabbitMQ] Conectado. Fila: ${QUEUE}`
    );

    return channel;

  } catch (error) {
    connection = null;
    channel = null;

    console.error(
      '[RabbitMQ] Não foi possível conectar:',
      error.message
    );

    throw error;
  }
};

const obterFila = () => QUEUE;

const fecharConexao = async () => {
  try {
    if (channel) {
      await channel.close();
    }

    if (connection) {
      await connection.close();
    }
  } catch (error) {
    console.error(
      '[RabbitMQ] Erro ao fechar conexão:',
      error.message
    );
  } finally {
    channel = null;
    connection = null;
  }
};

module.exports = {
  conectarRabbitMQ,
  obterFila,
  fecharConexao,
};
