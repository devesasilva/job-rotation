const authMiddleware = require("../../src/middlewares/authMiddleware");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

describe("authMiddleware", () => {
  test("deve retornar 401 sem header", () => {
    const req = { header: () => null };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    authMiddleware(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("deve retornar 401 token inválido", () => {
    const req = { header: () => "Bearer 123" };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jwt.verify.mockImplementation(() => { throw new Error(); });

    authMiddleware(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
