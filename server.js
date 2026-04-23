const { app } = require("./src/app");
const { port } = require("./src/config");
const { initializeStore } = require("./src/data/store");

initializeStore();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});
