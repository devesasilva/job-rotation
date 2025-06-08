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