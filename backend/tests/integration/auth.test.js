const request = require("supertest");
const app = require("../helpers/testServer");
const db = require("../helpers/setup-db");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

describe("Auth - Integração", () => {
  test("registro", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        nome: "Teste",
        email: "t@t.com",
        senha: "123"
      });

    expect(res.statusCode).toBe(201);
  });

  test("login", async () => {
    await request(app).post("/auth/register").send({
      nome: "Teste",
      email: "t@t.com",
      senha: "123"
    });

    const res = await request(app).post("/auth/login").send({
      email: "t@t.com",
      senha: "123"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
