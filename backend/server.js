require("dotenv").config();
const express = require("express");
const app = express();
const ConexaoDB = require("./config/db");
const PORT = process.env.PORT;
const cors = require('cors');

const Usuario = require("./src/models/Usuario");
const Equipe = require("./src/models/Equipe");
const Setor = require("./src/models/Setor");
const Rodizio = require("./src/models/Rodizio");

app.use(express.json());
ConexaoDB();
app.use(cors());

app.use(require("./src/routes/index"));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});