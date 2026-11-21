const express = require('express');
const router = express.Router();

const authMiddleware =
  require('../middlewares/authMiddleware');
const notificacaoController =
  require('../controllers/notificacaoController');

/**
 * @swagger
 * tags:
 *   name: Notificações
 *   description: Consultas e leitura de notificações do usuário
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/notificacoes/stream:
 *   get:
 *     summary: Abre o fluxo SSE de novas notificações
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fluxo de eventos conectado
 *       401:
 *         description: Token inválido ou não fornecido
 */
router.get('/stream', notificacaoController.stream);

/**
 * @swagger
 * /api/notificacoes/nao-lidas:
 *   get:
 *     summary: Conta notificações não lidas
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de notificações não lidas
 *       401:
 *         description: Usuário não autenticado
 */
router.get(
  '/nao-lidas',
  notificacaoController.contarNaoLidas
);

/**
 * @swagger
 * /api/notificacoes:
 *   get:
 *     summary: Lista notificações do usuário autenticado
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: naoLidas
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista paginada de notificações
 *       401:
 *         description: Usuário não autenticado
 */
router.get('/', notificacaoController.listar);

/**
 * @swagger
 * /api/notificacoes/lidas:
 *   patch:
 *     summary: Marca todas as notificações como lidas
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificações atualizadas
 *       401:
 *         description: Usuário não autenticado
 */
router.patch(
  '/lidas',
  notificacaoController.marcarTodasComoLidas
);

/**
 * @swagger
 * /api/notificacoes:
 *   delete:
 *     summary: Remove permanentemente todas as notificações do usuário
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificações removidas
 *       401:
 *         description: Usuário não autenticado
 */
router.delete(
  '/',
  notificacaoController.limparTodas
);

/**
 * @swagger
 * /api/notificacoes/{id}/lida:
 *   patch:
 *     summary: Marca uma notificação como lida
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificação atualizada
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Notificação não encontrada
 */
router.patch(
  '/:id/lida',
  notificacaoController.marcarComoLida
);

module.exports = router;
