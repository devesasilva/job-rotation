const Setor = require("../../src/models/Setor");

module.exports = async function createSetor(equipeId, data = {}) {
  return Setor.create({
    nome: data.nome || "Setor Teste",
    descricao: data.descricao || "Setor para testes",
    equipe: equipeId
  });
};
