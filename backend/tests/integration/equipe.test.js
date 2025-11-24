const request = require("supertest");
const app = require("../helpers/testServer");
const db = require("../helpers/setup-db");
const createUser = require("../helpers/createTestUser");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

describe("Equipes - Integração", () => {
  let token;
  let usuario;

  beforeEach(async () => {
    usuario = await createUser({
      email: "user@test.com",
      senha: "123"
    });

    const login = await request(app)
      .post("/auth/login")
      .send({
        email: "user@test.com",
        senha: "123"
      });

    console.log("TOKEN GERADO:", login.body.token);

    token = login.body.token;
  });

  test("criar equipe", async () => {
    const res = await request(app)
      .post("/equipes/criar")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Equipe Legal",
        membros: [{ usuario: usuario._id }]
      });

    expect(res.statusCode).toBe(201);
  });

  test("listar equipes", async () => {
    const res = await request(app)
      .get("/equipes/listar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

  });
});
