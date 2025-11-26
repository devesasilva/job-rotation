const bcrypt = require("bcryptjs");
const Usuario = require("../../src/models/Usuario");

module.exports = async function createTestUser(data = {}) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(data.senha || "123", salt);

  return Usuario.create({
    nome: data.nome || "User Teste",
    email: data.email || "user@test.com",
    senha: hash,
    formacao: data.formacao,
    habilidades: data.habilidades || [],
    dataInicioCargoAtual: data.dataInicioCargoAtual
  });
};
