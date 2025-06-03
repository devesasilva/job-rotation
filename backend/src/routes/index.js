const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');  // ajuste o caminho se necessário
const rodizioRoutes = require('./rodizioRoutes');

// Rota simples de teste
router.get('/', (req, res) => {
  res.send('API está funcionando! 🚀');
});

// Rota de autenticação
router.use('/auth', authRoutes);
router.use('/rodizios', rodizioRoutes);

module.exports = router;

