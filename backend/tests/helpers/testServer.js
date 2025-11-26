const express = require("express");
const routes = require("../../src/routes/index");

const app = express();
app.use(express.json());
app.use("/", routes);

module.exports = app;
