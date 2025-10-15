const express = require("express");
const router = express.Router();
const rodizioController = require("../controllers/rodizioController");

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             # Defina os campos do rodízio conforme seu modelo
 *     responses:
 *       201:
 *         description: Rodízio criado com sucesso
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /rodizio/listar:
 *   get:
 *     summary: Lista todos os rodízios
 *     tags: [Rodízio]
 *     responses:
 *       200:
 *         description: Lista de rodízios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 # Adicione o schema do rodízio se desejar
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /rodizio/listar/{id}:
 *   get:
 *     summary: Busca um rodízio pelo ID
 *     tags: [Rodízio]
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
 *               # Adicione o schema do rodízio se desejar
 *       404:
 *         description: Rodízio não encontrado
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /rodizio/editar/{id}:
 *   put:
 *     summary: Atualiza um rodízio pelo ID
 *     tags: [Rodízio]
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
 *             # Defina os campos que podem ser atualizados
 *     responses:
 *       200:
 *         description: Rodízio atualizado com sucesso
 *       404:
 *         description: Rodízio não encontrado
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /rodizio/deletar/{id}:
 *   delete:
 *     summary: Deleta um rodízio pelo ID
 *     tags: [Rodízio]
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
 *       404:
 *         description: Rodízio não encontrado
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /rodizio/{id}/sugestoes:
 *   get:
 *     summary: Sugere alocações para um rodízio pelo ID
 *     tags: [Rodízio]
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
 *       404:
 *         description: Rodízio não encontrado
 *       500:
 *         description: Erro no servidor
 */