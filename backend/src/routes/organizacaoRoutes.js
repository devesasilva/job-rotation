const express = require('express');

const router = express.Router();

const organizacaoController = require('../controllers/organizacaoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/criar', organizacaoController.criarOrganizacao);
router.get('/:id', organizacaoController.buscarOrganizacao);

module.exports = router;