const Equipe = require("../../src/models/Equipe");

module.exports = async function createEquipe(usuarioId, data = {}) {
  return Equipe.create({
    nome: data.nome || "Equipe Teste",
    descricao: data.descricao || "Equipe para testes",
    membros: [{ usuario: usuarioId, perfil: "colaborador" }]
  });
};
