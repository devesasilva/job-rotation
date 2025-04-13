require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json()); // Aceita JSON no body das requisições

// Roteador principal
app.use(require('./src/routes/index'));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
