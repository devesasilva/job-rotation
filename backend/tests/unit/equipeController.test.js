const equipeController = require("../../src/controllers/equipeController");
const Equipe = require("../../src/models/Equipe");
const Usuario = require("../../src/models/Usuario");
const httpMocks = require("node-mocks-http");

jest.mock("../../src/models/Usuario");
jest.mock("../../src/models/Equipe");

describe("EquipeController", () => {
  afterEach(() => jest.clearAllMocks());

  test("criarEquipe - usuário não existe", async () => {
    Usuario.findById.mockResolvedValue(null);

    const req = httpMocks.createRequest({
      body: { nome: "Equipe", membros: [{ usuario: "1" }] }
    });
    const res = httpMocks.createResponse();

    await equipeController.criarEquipe(req, res);

    expect(res.statusCode).toBe(400);
  });

  test("criarEquipe - sucesso", async () => {
    Usuario.findById.mockResolvedValue({ nome: "User" });
    Equipe.prototype.save = jest.fn();

    const req = httpMocks.createRequest({
      body: {
        nome: "Equipe",
        membros: [{ usuario: "1" }],
      }
    });
    const res = httpMocks.createResponse();

    await equipeController.criarEquipe(req, res);

    expect(res.statusCode).toBe(201);
  });
});
