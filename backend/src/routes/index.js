const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');  
const setorRoutes = require('./setorRoutes')

// Rota simples de teste
router.get('/', (req, res) => {
  res.send('API está funcionando! 🚀');
});

// Rota de autenticação
router.use('/auth', authRoutes);
router.use('/setores', setorRoutes);

module.exports = router;

