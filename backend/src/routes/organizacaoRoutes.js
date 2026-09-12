const express = require('express');

const router = express.Router();

const organizacaoController = require('../controllers/organizacaoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/criar', organizacaoController.criarOrganizacao);
router.get('/:id', organizacaoController.buscarOrganizacao);

router.post('/:id/membros', organizacaoController.adicionarMembro);
router.get('/:id/membros', organizacaoController.listarMembros);
router.put('/:id/membros/:membroId', organizacaoController.editarMembro);
router.delete('/:id/membros/:membroId', organizacaoController.removerMembro);

module.exports = router;