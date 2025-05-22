const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');  // ajuste o caminho se necessário

// Rota simples de teste
router.get('/', (req, res) => {
  res.send('API está funcionando! 🚀');
});

// Rota de autenticação
router.use('/auth', authRoutes);

module.exports = router;

