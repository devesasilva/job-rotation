const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const equipeRoutes = require('./equipeRoutes');
const rodizioRoutes = require('./rodizioRoutes');
const setorRoutes = require('./setorRoutes');

router.get('/', (req, res) => {
  res.send('API está funcionando! 🚀');
});

router.use('/auth', authRoutes);
router.use('/equipes', equipeRoutes);
router.use('/rodizios', rodizioRoutes);
router.use('/setores', setorRoutes);

module.exports = router;