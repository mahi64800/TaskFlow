const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const { apiPrefix } = require("./config");
const { initializeStore } = require("./data/store");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRoutes = require("./routes/adminRoutes");
const openApiSpec = require("./docs/openapi");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

initializeStore();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("X-API-Version", "v1");
  next();
});

app.get(`${apiPrefix}/health`, (_req, res) => {
  res.json({
    data: {
      service: "TaskFlow API",
      status: "ok",
      version: "v1",
    },
  });
});

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/tasks`, taskRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
