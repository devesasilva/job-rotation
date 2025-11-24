const authController = require("../../src/controllers/authController");
const Usuario = require("../../src/models/Usuario");
const httpMocks = require("node-mocks-http");
const bcrypt = require("bcryptjs");

jest.mock("../../src/models/Usuario");
jest.mock("bcryptjs");

describe("AuthController", () => {
  afterEach(() => jest.clearAllMocks());

  test("register - email já cadastrado", async () => {
    Usuario.findOne.mockResolvedValue({ email: "teste@test.com" });

    const req = httpMocks.createRequest({
      body: { nome: "Teste", email: "teste@test.com", senha: "123" },
    });
    const res = httpMocks.createResponse();

    await authController.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().mensagem).toBe("E-mail já cadastrado.");
  });

  test("register - cria usuário", async () => {
    Usuario.findOne.mockResolvedValue(null);
    Usuario.prototype.save = jest.fn();
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashed");

    const req = httpMocks.createRequest({
      body: { nome: "Novo", email: "novo@test.com", senha: "123" },
    });
    const res = httpMocks.createResponse();

    await authController.register(req, res);

    expect(res.statusCode).toBe(201);
  });

  test("login - usuário não encontrado", async () => {
    Usuario.findOne.mockResolvedValue(null);

    const req = httpMocks.createRequest({ body: { email: "x", senha: "y" } });
    const res = httpMocks.createResponse();

    await authController.login(req, res);

    expect(res.statusCode).toBe(400);
  });

  test("login - senha incorreta", async () => {
    Usuario.findOne.mockResolvedValue({ senha: "hash" });
    bcrypt.compare.mockResolvedValue(false);

    const req = httpMocks.createRequest({ body: { email: "x", senha: "y" } });
    const res = httpMocks.createResponse();

    await authController.login(req, res);

    expect(res.statusCode).toBe(400);
  });
});
