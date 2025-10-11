const express = require("express");
const router = express.Router();
const equipeController = require("../controllers/equipeController");

router.post("/criar", equipeController.criarEquipe);
router.get("/listar", equipeController.listarEquipes);
router.get("/listar/:id", equipeController.listarEquipePorId);
router.put("/editar/:id", equipeController.atualizarEquipe);
router.delete("/deletar/:id", equipeController.deletarEquipe);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Equipes
 *   description: Endpoints para gerenciamento de equipes
 */

/**
 * @swagger
 * /equipes/criar:
 *   post:
 *     summary: Cria uma nova equipe
 *     tags: [Equipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - membros
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Equipe de Marketing
 *               descricao:
 *                 type: string
 *                 example: Equipe focada em marketing digital
 *               membros:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - usuario
 *                   properties:
 *                     usuario:
 *                       type: string
 *                       description: ID do usuário membro
 *                       example: 634c9a4b0a1234567890abcd
 *                     funcao:
 *                       type: string
 *                       description: Função na equipe
 *                       example: Coordenador
 *     responses:
 *       201:
 *         description: Equipe criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipe'
 *       400:
 *         description: Usuário não encontrado ou dados inválidos
 *       500:
 *         description: Erro no servidor
 *
 * /equipes/listar:
 *   get:
 *     summary: Lista todas as equipes
 *     tags: [Equipes]
 *     responses:
 *       200:
 *         description: Lista de equipes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipe'
 *       404:
 *         description: Nenhuma equipe encontrada
 *       500:
 *         description: Erro no servidor
 *
 * /equipes/listar/{id}:
 *   get:
 *     summary: Busca uma equipe pelo ID
 *     tags: [Equipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da equipe
 *     responses:
 *       200:
 *         description: Equipe encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipe'
 *       404:
 *         description: Equipe não encontrada
 *       500:
 *         description: Erro no servidor
 *
 * /equipes/editar/{id}:
 *   put:
 *     summary: Atualiza uma equipe pelo ID
 *     tags: [Equipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da equipe
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
 *               membros:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Membro'
 *     responses:
 *       200:
 *         description: Equipe atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipe'
 *       404:
 *         description: Equipe não encontrada
 *       500:
 *         description: Erro no servidor
 *
 * /equipes/deletar/{id}:
 *   delete:
 *     summary: Remove uma equipe pelo ID
 *     tags: [Equipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da equipe
 *     responses:
 *       200:
 *         description: Equipe removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Equipe removida com sucesso
 *       404:
 *         description: Equipe não encontrada
 *       500:
 *         description: Erro no servidor
 */