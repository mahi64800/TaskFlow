const { HttpError } = require("../lib/httpError");
const { parseNumericId, validStatuses, validateTaskPayload } = require("../lib/validators");
const { readDatabase, updateDatabase } = require("../data/store");

function canAccessTask(user, task) {
  return user.role === "admin" || task.ownerId === user.id;
}

function listTasks(req, res, next) {
  try {
    const db = readDatabase();
    let tasks =
      req.user.role === "admin"
        ? [...db.tasks]
        : db.tasks.filter((task) => task.ownerId === req.user.id);

    if (req.query.status) {
      const status = String(req.query.status).toLowerCase();

      if (!validStatuses.has(status)) {
        throw new HttpError(400, "status query must be one of: todo, in-progress, done.");
      }

      tasks = tasks.filter((task) => task.status === status);
    }

    tasks.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    return res.json({
      data: tasks,
    });
  } catch (error) {
    return next(error);
  }
}

function getTask(req, res, next) {
  try {
    const taskId = parseNumericId(req.params.id, "Task id");
    const db = readDatabase();
    const task = db.tasks.find((item) => item.id === taskId);

    if (!task || !canAccessTask(req.user, task)) {
      throw new HttpError(404, "Task not found.");
    }

    return res.json({
      data: task,
    });
  } catch (error) {
    return next(error);
  }
}

function createTask(req, res, next) {
  try {
    const payload = validateTaskPayload(req.body);
    const task = updateDatabase((db) => {
      const now = new Date().toISOString();
      const id = db.counters.tasks + 1;
      db.counters.tasks = id;

      const newTask = {
        createdAt: now,
        description: payload.description,
        dueDate: payload.dueDate,
        id,
        ownerId: req.user.id,
        ownerName: req.user.name,
        priority: payload.priority,
        status: payload.status,
        title: payload.title,
        updatedAt: now,
      };

      db.tasks.push(newTask);
      return newTask;
    });

    return res.status(201).json({
      data: task,
      message: "Task created successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

function updateTask(req, res, next) {
  try {
    const taskId = parseNumericId(req.params.id, "Task id");
    const payload = validateTaskPayload(req.body, { partial: true });

    const task = updateDatabase((db) => {
      const existingTask = db.tasks.find((item) => item.id === taskId);

      if (!existingTask || !canAccessTask(req.user, existingTask)) {
        throw new HttpError(404, "Task not found.");
      }

      Object.assign(existingTask, payload, {
        updatedAt: new Date().toISOString(),
      });

      return existingTask;
    });

    return res.json({
      data: task,
      message: "Task updated successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

function deleteTask(req, res, next) {
  try {
    const taskId = parseNumericId(req.params.id, "Task id");
    const deletedTask = updateDatabase((db) => {
      const index = db.tasks.findIndex((item) => item.id === taskId);

      if (index === -1 || !canAccessTask(req.user, db.tasks[index])) {
        throw new HttpError(404, "Task not found.");
      }

      return db.tasks.splice(index, 1)[0];
    });

    return res.json({
      data: deletedTask,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
};
