require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const ConexaoDB = require("./config/db");
const {swaggerUi, swaggerSpec} = require('./config/swagger');
const {
  iniciarConsumer,
} = require("./src/messaging/consumers/eventoConsumer");

const PORT = process.env.PORT || 3000;

ConexaoDB();

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));app.use(express.json()); 

app.use("/", require("./src/routes/index")); 

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

let retryConsumer = null;

const iniciarConsumerComRetry = async () => {
  try {
    await iniciarConsumer();
    if (retryConsumer) {
      clearInterval(retryConsumer);
      retryConsumer = null;
    }
  } catch (error) {
    console.error(
      "[Server] Não foi possível iniciar o consumer de eventos:",
      error.message
    );

    if (!retryConsumer) {
      retryConsumer = setInterval(
        iniciarConsumerComRetry,
        30000
      );
    }
  }
};

iniciarConsumerComRetry();
