require('dotenv').config();
const express = require('express');
const app = express();
const ConexaoDB = require('./config/db'); //importando o arquivo com config da database
const PORT = process.env.PORT || 3001;

const Usuario = require("./src/models/Usuario");
const Equipe = require("./src/models/Equipe");

app.use(express.json()); // Aceita JSON no body das requisições

ConexaoDB(); //chamando função que inicia o processo de conexão com a database

// Roteador principal
app.use(require('./src/routes/index'));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
