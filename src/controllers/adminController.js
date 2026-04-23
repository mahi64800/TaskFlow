const { readDatabase, withoutSensitiveUserFields } = require("../data/store");

function listUsers(req, res) {
  const db = readDatabase();
  const users = db.users.map((user) => {
    const safeUser = withoutSensitiveUserFields(user);
    const taskCount = db.tasks.filter((task) => task.ownerId === user.id).length;

    return {
      ...safeUser,
      taskCount,
    };
  });

  res.json({
    data: users,
  });
}

module.exports = {
  listUsers,
};
