require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const ConexaoDB = require("./config/db");
const {swaggerUi, swaggerSpec} = require('./config/swagger');

const PORT = process.env.PORT || 3000;

ConexaoDB();

app.use(cors({ 
  origin: ['http://localhost:5173', 
            'https://job-rotation.vercel.app'
  ],
  credentials: true }));
app.use(express.json()); 

app.use("/", require("./src/routes/index")); 

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
