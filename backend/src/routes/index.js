const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const equipeRoutes = require('./equipeRoutes');
const rodizioRoutes = require('./rodizioRoutes');
const setorRoutes = require('./setorRoutes');
const organizacaoRoutes = require('./organizacaoRoutes');

router.get('/api', (req, res) => {
  res.send('API está funcionando! 🚀');
});

router.use('/auth', authRoutes);
router.use('/equipes', equipeRoutes);
router.use('/rodizios', rodizioRoutes);
router.use('/setores', setorRoutes);
router.use('/organizacoes', organizacaoRoutes);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: API
 *   description: Endpoints principais da API
 */

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Testa se a API está funcionando
 *     tags: [API]
 *     responses:
 *       200:
 *         description: API funcionando
 */

/**
 * @swagger
 * /auth:
 *   $ref: './authRoutes.js'   # Aqui você pode linkar documentação externa se quiser modularizar
 */

/**
 * @swagger
 * /equipes:
 *   $ref: './equipeRoutes.js'
 */

/**
 * @swagger
 * /rodizios:
 *   $ref: './rodizioRoutes.js'
 */

/**
 * @swagger
 * /setores:
 *   $ref: './setorRoutes.js'
 */