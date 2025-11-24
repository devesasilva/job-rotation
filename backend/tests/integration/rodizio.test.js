const request = require("supertest");
const app = require("../helpers/testServer");
const db = require("../helpers/setup-db");

const createUser = require("../helpers/createTestUser");
const createEquipe = require("../helpers/createEquipe");
const createSetor = require("../helpers/createSetor");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

describe("Rodízios - Integração", () => {
  let token;
  let usuario;
  let setor;

  beforeEach(async () => {
    usuario = await createUser({ email: "rodizio@test.com", senha: "123" });

    const login = await request(app)
      .post("/auth/login")
      .send({ email: "rodizio@test.com", senha: "123" });

    token = login.body.token;

    const equipe = await createEquipe(usuario._id);
    setor = await createSetor(equipe._id);
  });

  test("criar rodízio", async () => {
    const res = await request(app)
      .post("/rodizios/criar")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Rodízio Mensal",
        descricao: "Teste de rodízio",
        ciclo: "Mensal",
        setor: setor._id,
        membros: [{ usuario: usuario._id }],
        necessidades: [
          { habilidade: "Python", formacao: "ADS", quantidade: 1 }
        ],
        dataInicio: "2025-01-01",
        dataFim: "2025-02-01"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.rodizio.nome).toBe("Rodízio Mensal");
  });

  test("listar rodízios", async () => {
    const res = await request(app)
      .get("/rodizios/listar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

  });

  test("buscar rodízio por id", async () => {
    const novo = await request(app)
      .post("/rodizios/criar")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Rodizio Teste",
        ciclo: "Mensal",
        setor: setor._id,
        membros: [{ usuario: usuario._id }],
        necessidades: [
          { habilidade: "Python", formacao: "ADS", quantidade: 1 }
        ],
        dataInicio: "2025-01-01",
        dataFim: "2025-02-01"
      });

    const id = novo.body.rodizio._id;

    const res = await request(app)
      .get(`/rodizios/listar/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe("Rodizio Teste");
  });
});
