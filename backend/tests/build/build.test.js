jest.mock("../../config/db", () => jest.fn());

jest.mock("express", () => {
  const express = jest.requireActual("express");
  express.application.listen = jest.fn(() => {});
  return express;
});

describe("Build", () => {
  test("server.js carrega sem erros", () => {
    expect(() => require("../../server")).not.toThrow();
  });
});
