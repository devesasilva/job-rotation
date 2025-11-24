const setorController = require("../../src/controllers/setorController");
const setorService = require("../../src/services/setorService");
const httpMocks = require("node-mocks-http");

jest.mock("../../src/services/setorService");

describe("SetorController", () => {
  test("criar - sucesso", async () => {
    setorService.criarSetor.mockResolvedValue({ nome: "RH" });

    const req = httpMocks.createRequest({ body: { nome: "RH" } });
    const res = httpMocks.createResponse();

    await setorController.criar(req, res);

    expect(res.statusCode).toBe(201);
  });

  test("listar - sucesso", async () => {
    setorService.listarSetores.mockResolvedValue([{ nome: "RH" }]);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await setorController.listar(req, res);

    expect(res.statusCode).toBe(200);
  });

  test("buscarPorId - setor não encontrado", async () => {
    setorService.buscarPorId.mockResolvedValue(null);

    const req = httpMocks.createRequest({ params: { id: "1" } });
    const res = httpMocks.createResponse();

    await setorController.buscarPorId(req, res);

    expect(res.statusCode).toBe(404);
  });
});
