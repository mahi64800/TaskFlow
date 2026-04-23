const fs = require("fs");
const path = require("path");
const { dataFile, defaultAdmin } = require("../config");
const { hashPassword } = require("../lib/password");

let initialized = false;

function createEmptyDatabase() {
  return {
    counters: {
      tasks: 0,
      users: 0,
    },
    tasks: [],
    users: [],
  };
}

function writeRawDatabase(db) {
  fs.writeFileSync(dataFile, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

function readRawDatabase() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function normalizeDatabase(db) {
  db.users = Array.isArray(db.users) ? db.users : [];
  db.tasks = Array.isArray(db.tasks) ? db.tasks : [];
  db.counters = db.counters || {};

  db.counters.users = Math.max(
    Number(db.counters.users || 0),
    ...db.users.map((user) => Number(user.id || 0))
  );
  db.counters.tasks = Math.max(
    Number(db.counters.tasks || 0),
    ...db.tasks.map((task) => Number(task.id || 0))
  );

  return db;
}

function nextId(db, collectionName) {
  db.counters[collectionName] += 1;
  return db.counters[collectionName];
}

function seedAdminIfNeeded(db) {
  const hasAdmin = db.users.some((user) => user.role === "admin");

  if (hasAdmin) {
    return;
  }

  const now = new Date().toISOString();

  db.users.push({
    createdAt: now,
    email: defaultAdmin.email,
    id: nextId(db, "users"),
    name: defaultAdmin.name,
    passwordHash: hashPassword(defaultAdmin.password),
    role: "admin",
    updatedAt: now,
  });
}

function initializeStore() {
  if (initialized) {
    return;
  }

  fs.mkdirSync(path.dirname(dataFile), { recursive: true });

  if (!fs.existsSync(dataFile)) {
    writeRawDatabase(createEmptyDatabase());
  }

  const db = normalizeDatabase(readRawDatabase());
  seedAdminIfNeeded(db);
  writeRawDatabase(db);
  initialized = true;
}

function readDatabase() {
  initializeStore();
  return normalizeDatabase(readRawDatabase());
}

function updateDatabase(mutator) {
  const db = readDatabase();
  const result = mutator(db);
  writeRawDatabase(normalizeDatabase(db));
  return result;
}

function withoutSensitiveUserFields(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  initializeStore,
  readDatabase,
  updateDatabase,
  withoutSensitiveUserFields,
};
