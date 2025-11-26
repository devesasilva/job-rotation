const rodizioService = require("../../src/services/rodizioService");
const Rodizio = require("../../src/models/Rodizio");
const Usuario = require("../../src/models/Usuario");

jest.mock("../../src/models/Rodizio");
jest.mock("../../src/models/Usuario");

describe("rodizioService", () => {
  test("erro se rodízio não existe", async () => {
    Rodizio.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });

    await expect(rodizioService.sugerirAlocacoes("123"))
      .rejects
      .toThrow("Rodízio inválido ou sem necessidades definidas.");
  });
});
