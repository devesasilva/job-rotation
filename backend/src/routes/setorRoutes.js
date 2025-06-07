const express = require('express');
const router = express.Router();
const setorController = require('../controllers/setorController');

router.post('/', setorController.criar);
router.get('/', setorController.listar);
router.get('/:id', setorController.buscarPorId);
router.put('/:id', setorController.atualizar);
router.delete('/:id', setorController.deletar);

module.exports = router;
