const express = require("express");
const router = express.Router();
const equipeController = require("../controllers/equipeController");

router.post("/criar", equipeController.criarEquipe);
router.get("/listar", equipeController.listarEquipes);
router.get("/listar/:id", equipeController.listarEquipePorId);
router.put("/editar/:id", equipeController.atualizarEquipe);
router.delete("/deletar/:id", equipeController.deletarEquipe);

module.exports = router;