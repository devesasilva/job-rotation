
require('dotenv').config();

const ConexaoDB = require('../config/db');

const {
  iniciarConsumer,
} = require('../src/messaging/consumers/eventoConsumer');

const {
  fecharConexao,
} = require('../config/rabbitmq');

const iniciarWorker = async () => {
  try {
    console.log('[Worker] Inicializando consumidor...');

    await ConexaoDB();
    await iniciarConsumer();

  } catch (error) {
    console.error(
      '[Worker] Erro ao iniciar consumidor:',
      error
    );

    process.exitCode = 1;
  }
};

const encerrarWorker = async () => {
  console.log('[Worker] Encerrando consumidor...');

  await fecharConexao();

  process.exit(0);
};

process.on('SIGINT', encerrarWorker);
process.on('SIGTERM', encerrarWorker);

iniciarWorker();
