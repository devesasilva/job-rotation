const express = require("express");
const router = express.Router();
const rodizioController = require("../controllers/rodizioController");

router.post("/criar", rodizioController.criarRodizio);
router.get("/listar", rodizioController.listarRodizios);
router.put("/editar/:id", rodizioController.atualizarRodizio);
router.delete("/deletar/:id", rodizioController.deletarRodizio);

module.exports = router;