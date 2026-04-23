const express = require("express");
const {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} = require("../controllers/taskController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", listTasks);
router.post("/", createTask);
router.get("/:id", getTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
