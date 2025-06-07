const express = require('express');
const router = express.Router();
const setorController = require('../controllers/setorController');

router.post('/criar', setorController.criar);
router.get('/listar', setorController.listar);
router.get('/listar/:id', setorController.buscarPorId);
router.put('/editar/:id', setorController.atualizar);
router.delete('/deletar/:id', setorController.deletar);

module.exports = router;