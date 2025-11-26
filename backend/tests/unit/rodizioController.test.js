const rodizioController = require("../../src/controllers/rodizioController");
const Rodizio = require("../../src/models/Rodizio");
const Usuario = require("../../src/models/Usuario");
const httpMocks = require("node-mocks-http");

jest.mock("../../src/models/Rodizio");
jest.mock("../../src/models/Usuario");

describe("RodizioController", () => {
  test("criarRodizio - faltando campos", async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();

    await rodizioController.criarRodizio(req, res);

    expect(res.statusCode).toBe(400);
  });
});
