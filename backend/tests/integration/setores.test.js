const request = require("supertest");
const app = require("../helpers/testServer");
const db = require("../helpers/setup-db");
const createUser = require("../helpers/createTestUser");
const createEquipe = require("../helpers/createEquipe");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

describe("Setores - Integração", () => {
  let token;
  let equipe;

  beforeEach(async () => {
    const usuario = await createUser({ email: "setor@test.com", senha: "123" });

    const login = await request(app)
      .post("/auth/login")
      .send({ email: "setor@test.com", senha: "123" });

    token = login.body.token;

    equipe = await createEquipe(usuario._id);
  });

  test("criar setor", async () => {
    const res = await request(app)
      .post("/setores/criar")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Setor TI",
        descricao: "Tecnologia",
        equipe: equipe._id
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.nome).toBe("Setor TI");
  });

  test("listar setores", async () => {
    const res = await request(app)
      .get("/setores/listar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("buscar setor por id", async () => {
    const novo = await request(app)
      .post("/setores/criar")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Setor RH",
        equipe: equipe._id
      });

    const id = novo.body._id;

    const res = await request(app)
      .get(`/setores/listar/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe("Setor RH");
  });
});
