const dbConfig = require("../../config/db");
const swagger = require("../../config/swagger");

describe("Infra - configs", () => {
  test("db export deve ser uma função", () => {
    expect(typeof dbConfig).toBe("function");
  });

  test("swagger deve exportar swaggerSpec e swaggerUi", () => {
    expect(swagger).toHaveProperty("swaggerSpec");
    expect(swagger).toHaveProperty("swaggerUi");
  });
});
