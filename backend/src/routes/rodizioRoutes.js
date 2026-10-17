
const express = require('express');

const router = express.Router({
  mergeParams: true,
});

const rodizioController =
  require('../controllers/rodizioController');

// Criar e listar rodízios.
router.post(
  '/',
  rodizioController.criarRodizio
);

router.get(
  '/',
  rodizioController.listarRodizios
);

router.patch(
  '/:rodizioId',
  rodizioController.atualizarRodizio
);

router.delete(
  '/:rodizioId',
  rodizioController.excluirRodizio
);

router.post(
  '/:rodizioId/rotacionar',
  rodizioController.rotacionarRodizio
);

// Consultar a rotação atual do usuário.
router.get(
  '/minha',
  rodizioController.listarMinhaRotacaoAtual
);

// Gerenciar membros do rodízio.
router.post(
  '/:rodizioId/membros',
  rodizioController.adicionarMembro
);

router.delete(
  '/:rodizioId/membros/:membroId',
  rodizioController.removerMembro
);

// Gerenciar funções do rodízio.
router.post(
  '/:rodizioId/funcoes',
  rodizioController.adicionarFuncao
);

router.delete(
  '/:rodizioId/funcoes/:funcaoId',
  rodizioController.removerFuncao
);

// Gerenciar as linhas de membro e função do rodízio.
router.post(
  '/:rodizioId/atribuicoes',
  rodizioController.adicionarAtribuicao
);

router.patch(
  '/:rodizioId/atribuicoes/:atribuicaoId',
  rodizioController.atualizarAtribuicao
);

router.delete(
  '/:rodizioId/atribuicoes/:atribuicaoId',
  rodizioController.removerAtribuicao
);

// Consultar um rodízio específico.
router.get(
  '/:rodizioId',
  rodizioController.buscarRodizioPorId
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Rodízio
 *   description: Endpoints para gerenciamento de rodízios
 */

/**
 * @swagger
 * /organizacoes/{id}/rodizios:
 *   post:
 *     summary: Cria um rodízio
 *     description: >
 *       Cria um rodízio para a organização.
 *       Os membros e as funções podem ser associados posteriormente.
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da organização
 *         schema:
 *           type: string
 *           example: 68c123456789abcdef123456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataInicio
 *               - dataFim
 *             properties:
 *               ciclo:
 *                 type: string
 *                 description: Ciclo da rotação
 *                 enum:
 *                   - Diário
 *                   - Semanal
 *                   - Quinzenal
 *                   - Mensal
 *                   - Anual
 *                 default: Mensal
 *                 example: Mensal
 *               dataInicio:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora de início da rotação
 *                 example: "2026-10-05T00:00:00.000Z"
 *               dataFim:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora de término da rotação
 *                 example: "2026-11-05T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Rotação agendada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Rotação agendada com sucesso!
 *                 rodizio:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68c423456789abcdef123456
 *                     organizacao:
 *                       type: string
 *                       example: 68c123456789abcdef123456
 *                     participante:
 *                       type: object
 *                     funcao:
 *                       type: object
 *                     ciclo:
 *                       type: string
 *                       example: Mensal
 *                     dataInicio:
 *                       type: string
 *                       format: date-time
 *                     dataFim:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos, participante ou função não pertencente à organização, período inválido ou ciclo inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não possui permissão para agendar rotações
 *       409:
 *         description: Participante já possui uma rotação neste período
 *       500:
 *         description: Erro interno do servidor
 *
 *   get:
 *     summary: Lista as rotações da organização
 *     description: Retorna todas as rotações cadastradas na organização.
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da organização
 *         schema:
 *           type: string
 *           example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Lista de rotações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 68c423456789abcdef123456
 *                   organizacao:
 *                     type: string
 *                     example: 68c123456789abcdef123456
 *                   participante:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       perfil:
 *                         type: string
 *                         example: PARTICIPANTE
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           nome:
 *                             type: string
 *                             example: Maria Silva
 *                           email:
 *                             type: string
 *                             example: maria@email.com
 *                   funcao:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       nome:
 *                         type: string
 *                         example: Desenvolvedora Backend
 *                       descricao:
 *                         type: string
 *                         example: Responsável pelo desenvolvimento das APIs
 *                   ciclo:
 *                     type: string
 *                     example: Mensal
 *                   dataInicio:
 *                     type: string
 *                     format: date-time
 *                   dataFim:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não pertence à organização
 *       500:
 *         description: Erro interno do servidor
 *
 * /organizacoes/{id}/rodizios/minha:
 *   get:
 *     summary: Consulta minha rotação atual
 *     description: Retorna as rotações atuais do usuário autenticado na organização.
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da organização
 *         schema:
 *           type: string
 *           example: 68c123456789abcdef123456
 *     responses:
 *       200:
 *         description: Rotações atuais do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 68c423456789abcdef123456
 *                   organizacao:
 *                     type: string
 *                     example: 68c123456789abcdef123456
 *                   participante:
 *                     type: string
 *                     example: 68c223456789abcdef123456
 *                   funcao:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       nome:
 *                         type: string
 *                         example: Desenvolvedora Backend
 *                       descricao:
 *                         type: string
 *                         example: Responsável pelo desenvolvimento das APIs
 *                   ciclo:
 *                     type: string
 *                     example: Mensal
 *                   dataInicio:
 *                     type: string
 *                     format: date-time
 *                   dataFim:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não pertence à organização
 *       500:
 *         description: Erro interno do servidor
 *
 * /organizacoes/{id}/rodizios/{rodizioId}:
 *   patch:
 *     summary: Atualiza ciclo e período de um rodízio
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: rodizioId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciclo:
 *                 type: string
 *                 enum: [Diário, Semanal, Quinzenal, Mensal, Anual]
 *               dataInicio:
 *                 type: string
 *                 format: date-time
 *               dataFim:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Rodízio atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Rodízio não encontrado
 *
 *   delete:
 *     summary: Exclui um rodízio
 *     description: Remove o rodízio e todas as suas atribuições.
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: rodizioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rodízio excluído
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Rodízio não encontrado
 *
 *   get:
 *     summary: Busca uma rotação pelo ID
 *     description: Retorna os detalhes de uma rotação específica da organização.
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da organização
 *         schema:
 *           type: string
 *           example: 68c123456789abcdef123456
 *       - in: path
 *         name: rodizioId
 *         required: true
 *         description: ID da rotação
 *         schema:
 *           type: string
 *           example: 68c423456789abcdef123456
 *     responses:
 *       200:
 *         description: Rotação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 68c423456789abcdef123456
 *                 organizacao:
 *                   type: string
 *                   example: 68c123456789abcdef123456
 *                 participante:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     perfil:
 *                       type: string
 *                       example: PARTICIPANTE
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         nome:
 *                           type: string
 *                           example: Maria Silva
 *                         email:
 *                           type: string
 *                           example: maria@email.com
 *                 funcao:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     nome:
 *                       type: string
 *                       example: Desenvolvedora Backend
 *                     descricao:
 *                       type: string
 *                       example: Responsável pelo desenvolvimento das APIs
 *                 ciclo:
 *                   type: string
 *                   example: Mensal
 *                 dataInicio:
 *                   type: string
 *                   format: date-time
 *                 dataFim:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não pertence à organização
 *       404:
 *         description: Rotação não encontrada nesta organização
 *       500:
 *         description: Erro interno do servidor
 *
 * /organizacoes/{id}/rodizios/{rodizioId}/atribuicoes:
 *   post:
 *     summary: Adiciona uma linha à distribuição do rodízio
 *     description: Cria uma linha com membro e função opcionais. Membros e funções podem se repetir.
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: rodizioId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membroId:
 *                 type: string
 *                 nullable: true
 *               funcaoId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Linha adicionada
 *       400:
 *         description: Identificador inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Membro ou função não pertence à organização
 * /organizacoes/{id}/rodizios/{rodizioId}/atribuicoes/{atribuicaoId}:
 *   patch:
 *     summary: Atualiza as células de uma linha
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: rodizioId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: atribuicaoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membroId:
 *                 type: string
 *                 nullable: true
 *               funcaoId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Linha atualizada
 *       400:
 *         description: Nenhuma célula informada ou identificador inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Linha, membro ou função não encontrada
 *
 *   delete:
 *     summary: Remove uma linha da distribuição do rodízio
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: rodizioId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: atribuicaoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Linha removida
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Linha não encontrada
 *
 * /organizacoes/{id}/rodizios/{rodizioId}/rotacionar:
 *   post:
 *     summary: Rotaciona manualmente os membros do rodízio
 *     description: Passa cada membro para a próxima linha conforme a ordem da tabela, mantendo as funções fixas.
 *     tags: [Rodízio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: rodizioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rodízio rotacionado
 *       400:
 *         description: É necessário ter pelo menos duas linhas no rodízio
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Rodízio não encontrado
 */
