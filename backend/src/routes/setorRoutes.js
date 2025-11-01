const express = require('express');
const router = express.Router();
const setorController = require('../controllers/setorController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.post('/criar', setorController.criar);
router.get('/listar', setorController.listar);
router.get('/listar/:id', setorController.buscarPorId);
router.put('/editar/:id', setorController.atualizar);
router.delete('/deletar/:id', setorController.deletar);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Setores
 *   description: Endpoints para gerenciamento de setores
 */

/**
 * @swagger
 * /setor/criar:
 *   post:
 *     summary: Cria um novo setor
 *     tags: [Setores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Setor de Marketing
 *               descricao:
 *                 type: string
 *                 example: Responsável pelas campanhas publicitárias
 *     responses:
 *       201:
 *         description: Setor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Setor criado com sucesso
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /setor/listar:
 *   get:
 *     summary: Lista todos os setores
 *     tags: [Setores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de setores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   nome:
 *                     type: string
 *                   descricao:
 *                     type: string
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /setor/listar/{id}:
 *   get:
 *     summary: Busca um setor pelo ID
 *     tags: [Setores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do setor
 *     responses:
 *       200:
 *         description: Setor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nome:
 *                   type: string
 *                 descricao:
 *                   type: string
 *       404:
 *         description: Setor não encontrado
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /setor/editar/{id}:
 *   put:
 *     summary: Atualiza um setor pelo ID
 *     tags: [Setores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do setor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Setor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Setor atualizado com sucesso
 *       404:
 *         description: Setor não encontrado
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /setor/deletar/{id}:
 *   delete:
 *     summary: Deleta um setor pelo ID
 *     tags: [Setores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do setor
 *     responses:
 *       200:
 *         description: Setor removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Setor removido com sucesso
 *       404:
 *         description: Setor não encontrado
 *       500:
 *         description: Erro no servidor
 */