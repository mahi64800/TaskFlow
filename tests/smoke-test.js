const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  return { data, response };
}

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "taskflow-assignment-"));
  process.env.DATA_FILE = path.join(tempDir, "db.json");
  process.env.JWT_SECRET = "test-secret";

  const { app } = require("../src/app");
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const register = await requestJson(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Riya Patel",
        email: "riya@example.com",
        password: "StrongPass1",
      }),
    });

    assert.equal(register.response.status, 201);
    assert.equal(register.data.data.user.role, "user");

    const userToken = register.data.data.token;

    const createTask = await requestJson(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: "Finish internship submission",
        description: "Double-check docs and tests.",
        status: "todo",
        priority: "high",
      }),
    });

    assert.equal(createTask.response.status, 201);
    assert.equal(createTask.data.data.title, "Finish internship submission");

    const taskId = createTask.data.data.id;

    const updateTask = await requestJson(`${baseUrl}/api/v1/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        status: "done",
      }),
    });

    assert.equal(updateTask.response.status, 200);
    assert.equal(updateTask.data.data.status, "done");

    const adminLogin = await requestJson(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "Admin@12345",
      }),
    });

    assert.equal(adminLogin.response.status, 200);

    const adminToken = adminLogin.data.data.token;
    const listUsers = await requestJson(`${baseUrl}/api/v1/admin/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.equal(listUsers.response.status, 200);
    assert.ok(listUsers.data.data.length >= 2);

    const health = await requestJson(`${baseUrl}/api/v1/health`);
    assert.equal(health.response.status, 200);

    console.log("Smoke tests passed.");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
