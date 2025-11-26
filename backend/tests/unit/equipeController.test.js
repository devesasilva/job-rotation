const equipeController = require("../../src/controllers/equipeController");
const Equipe = require("../../src/models/Equipe");
const Usuario = require("../../src/models/Usuario");
const httpMocks = require("node-mocks-http");

jest.mock("../../src/models/Usuario");
jest.mock("../../src/models/Equipe");

describe("EquipeController", () => {
  afterEach(() => jest.clearAllMocks());

  test("criarEquipe - sem nome retorna 400", async () => {
    const req = httpMocks.createRequest({
      user: { id: "userId123" },
      body: {}
    });
    const res = httpMocks.createResponse();

    await equipeController.criarEquipe(req, res);

    expect(res.statusCode).toBe(400);
  });

  test("criarEquipe - sucesso com nome e usuário do token", async () => {
    Equipe.prototype.save = jest.fn().mockResolvedValue(true);

    const req = httpMocks.createRequest({
      user: { id: "userId123" },
      body: { nome: "Equipe X", descricao: "Desc" }
    });
    const res = httpMocks.createResponse();

    await equipeController.criarEquipe(req, res);

    expect(res.statusCode).toBe(201);
  });

  test("listarEquipes - sem usuário no token retorna 401", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    await equipeController.listarEquipes(req, res);
    expect(res.statusCode).toBe(401);
  });
});
