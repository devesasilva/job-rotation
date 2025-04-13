const express = require('express');
const router = express.Router();

// Exemplo de rota simples
router.get('/', (req, res) => {
  res.send('API está funcionando! 🚀');
});

module.exports = router;
