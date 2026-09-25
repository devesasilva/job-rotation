const express = require('express');

const router = express.Router();

const organizacaoController = require('../controllers/organizacaoController');
const funcaoController = require('../controllers/funcaoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/criar', organizacaoController.criarOrganizacao);
router.get('/:id', organizacaoController.buscarOrganizacao);

router.post('/:id/membros', organizacaoController.adicionarMembro);
router.get('/:id/membros', organizacaoController.listarMembros);
router.put('/:id/membros/:membroId', organizacaoController.editarMembro);
router.delete('/:id/membros/:membroId', organizacaoController.removerMembro);

router.post('/:id/funcoes', funcaoController.criar);
router.get('/:id/funcoes', funcaoController.listar);

module.exports = router;