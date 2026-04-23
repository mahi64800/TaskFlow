const express = require("express");
const { listUsers } = require("../controllers/adminController");
const { requireAuth } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.use(requireAuth);
router.use(authorize("admin"));
router.get("/users", listUsers);

module.exports = router;
