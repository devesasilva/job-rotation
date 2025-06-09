require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const ConexaoDB = require("./config/db");

const PORT = process.env.PORT || 3000;

ConexaoDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json()); 

app.use("/api", require("./src/routes/index")); 


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
