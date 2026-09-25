const express = require('express');

const router = express.Router();

const organizacaoController = require('../controllers/organizacaoController');
const funcaoController = require('../controllers/funcaoController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Organizações
 *   description: Endpoints relacionados às organizações
 *
 * tags:
 *   name: Funções
 *   description: Gerenciamento de funções das organizações
 */

router.use(authMiddleware);

/**
 * @swagger
 * /organizacoes/criar:
 *   post:
 *     summary: Cria uma nova organização
 *     tags: [Organizações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Organização criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       500:
 *         description: Erro no servidor
 */
router.post('/criar', organizacaoController.criarOrganizacao);

/**
 * @swagger
 * /organizacoes/{id}:
 *   get:
 *     summary: Busca uma organização pelo ID
 *     tags: [Organizações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da organização
 *     responses:
 *       200:
 *         description: Organização encontrada
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Organização não encontrada
 *       500:
 *         description: Erro no servidor
 */
router.get('/:id', organizacaoController.buscarOrganizacao);

/**
 * @swagger
 * /organizacoes/{id}/membros:
 *   post:
 *     summary: Adiciona um membro à organização
 *     tags: [Organizações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da organização
 *     responses:
 *       201:
 *         description: Membro adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       500:
 *         description: Erro no servidor
 *
 *   get:
 *     summary: Lista os membros da organização
 *     tags: [Organizações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da organização
 *     responses:
 *       200:
 *         description: Lista de membros
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       500:
 *         description: Erro no servidor
 */
router.post('/:id/membros', organizacaoController.adicionarMembro);
router.get('/:id/membros', organizacaoController.listarMembros);

/**
 * @swagger
 * /organizacoes/{id}/membros/{membroId}:
 *   put:
 *     summary: Edita um membro da organização
 *     tags: [Organizações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: membroId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Membro atualizado com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Membro não encontrado
 *       500:
 *         description: Erro no servidor
 *
 *   delete:
 *     summary: Remove um membro da organização
 *     tags: [Organizações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: membroId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Membro removido com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Membro não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.put('/:id/membros/:membroId', organizacaoController.editarMembro);
router.delete('/:id/membros/:membroId', organizacaoController.removerMembro);

/**
 * @swagger
 * /organizacoes/{id}/funcoes:
 *   post:
 *     summary: Cadastra uma função na organização
 *     tags: [Funções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da organização
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
 *                 example: Desenvolvedor Backend
 *               descricao:
 *                 type: string
 *                 example: Responsável pelo desenvolvimento e manutenção das APIs.
 *     responses:
 *       201:
 *         description: Função cadastrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não possui permissão de administrador
 *       500:
 *         description: Erro no servidor
 *
 *   get:
 *     summary: Lista as funções da organização
 *     tags: [Funções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da organização
 *     responses:
 *       200:
 *         description: Lista de funções da organização
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não possui permissão de administrador
 *       500:
 *         description: Erro no servidor
 */
router.post('/:id/funcoes', funcaoController.criar);
router.get('/:id/funcoes', funcaoController.listar);

module.exports = router;