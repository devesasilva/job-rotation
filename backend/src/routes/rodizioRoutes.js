const express = require("express");
const router = express.Router();
const rodizioController = require("../controllers/rodizioController");
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post("/criar", rodizioController.criarRodizio);
router.get("/listar", rodizioController.listarRodizios);
router.get("/listar/:id", rodizioController.listarRodizioPorId);
router.put("/editar/:id", rodizioController.atualizarRodizio);
router.delete("/deletar/:id", rodizioController.deletarRodizio);
router.get('/:id/sugestoes', rodizioController.sugerirAlocacoesRodizio );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Rodízio
 *   description: Endpoints para gerenciamento de rodízios
 */

/**
 * @swagger
 * /rodizio/criar:
 *   post:
 *     summary: Cria um novo rodízio
 *     tags: [Rodízio]
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
 *               - dataInicio
 *               - dataFim
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Rodízio de Equipe A
 *               descricao:
 *                 type: string
 *                 example: Rodízio mensal para equipe A
 *               dataInicio:
 *                 type: string
 *                 format: date
 *                 example: 2025-11-01
 *               dataFim:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-01
 *     responses:
 *       201:
 *         description: Rodízio criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Rodízio criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro no servidor
 *
 * /rodizio/listar:
 *   get:
 *     summary: Lista todos os rodízios
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rodízios
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
 *                   dataInicio:
 *                     type: string
 *                   dataFim:
 *                     type: string
 *       500:
 *         description: Erro no servidor
 *
 * /rodizio/listar/{id}:
 *   get:
 *     summary: Busca um rodízio pelo ID
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do rodízio
 *     responses:
 *       200:
 *         description: Rodízio encontrado
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
 *                 dataInicio:
 *                   type: string
 *                 dataFim:
 *                   type: string
 *       404:
 *         description: Rodízio não encontrado
 *       500:
 *         description: Erro no servidor
 *
 * /rodizio/editar/{id}:
 *   put:
 *     summary: Atualiza um rodízio pelo ID
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do rodízio
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
 *               dataInicio:
 *                 type: string
 *               dataFim:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rodízio atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Rodízio atualizado com sucesso
 *       404:
 *         description: Rodízio não encontrado
 *       500:
 *         description: Erro no servidor
 *
 * /rodizio/deletar/{id}:
 *   delete:
 *     summary: Deleta um rodízio pelo ID
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do rodízio
 *     responses:
 *       200:
 *         description: Rodízio removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Rodízio removido com sucesso
 *       404:
 *         description: Rodízio não encontrado
 *       500:
 *         description: Erro no servidor
 *
 * /rodizio/{id}/sugestoes:
 *   get:
 *     summary: Sugere alocações para um rodízio pelo ID
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do rodízio
 *     responses:
 *       200:
 *         description: Sugestões de alocação retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   usuario:
 *                     type: string
 *                   funcao:
 *                     type: string
 *       404:
 *         description: Rodízio não encontrado
 *       500:
 *         description: Erro no servidor
 */