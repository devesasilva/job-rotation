const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/teste', (req, res) => {
    res.send('Rota GET funcionando!');
});

router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Acesso autorizado', user: req.user })
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints de autenticação de usuários
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               formacao:
 *                 type: string
 *               dataInicialCargoAtual:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: E-mail já cadastrado
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Usuário não encontrado ou senha incorreta
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /teste:
 *   get:
 *     summary: Testa se a rota GET está funcionando
 *     tags: [Autenticação]
 *     responses:
 *       200:
 *         description: Rota GET funcionando
 */

/**
 * @swagger
 * /auth/protected:
 *   get:
 *     summary: Rota protegida que exige autenticação
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acesso autorizado
 *       401:
 *         description: Acesso negado
 */