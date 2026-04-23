const API_BASE = "/api/v1";
const state = {
  editingTaskId: null,
  tasks: [],
  token: localStorage.getItem("taskflow_token") || "",
  user: JSON.parse(localStorage.getItem("taskflow_user") || "null"),
};

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const taskForm = document.querySelector("#task-form");
const tabButtons = document.querySelectorAll(".tab-button");
const messageBox = document.querySelector("#message-box");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout-button");
const refreshButton = document.querySelector("#refresh-button");
const taskList = document.querySelector("#task-list");
const adminPanel = document.querySelector("#admin-panel");
const userList = document.querySelector("#user-list");

function toggleAuthTab(tab) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  loginForm.classList.toggle("hidden", tab !== "login");
  registerForm.classList.toggle("hidden", tab !== "register");
}

function showMessage(message, type = "success") {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
}

function hideMessage() {
  messageBox.className = "message hidden";
  messageBox.textContent = "";
}

function persistSession() {
  localStorage.setItem("taskflow_token", state.token);
  localStorage.setItem("taskflow_user", JSON.stringify(state.user));
}

function clearSession() {
  state.token = "";
  state.user = null;
  state.tasks = [];
  state.editingTaskId = null;
  localStorage.removeItem("taskflow_token");
  localStorage.removeItem("taskflow_user");
}

async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || "Request failed.");
  }

  return payload;
}

function setAuthenticatedUser(data) {
  state.token = data.token;
  state.user = data.user;
  persistSession();
  renderSession();
}

function toLocalDateTimeValue(isoString) {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function fromLocalDateTimeValue(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function resetTaskForm() {
  taskForm.reset();
  state.editingTaskId = null;
  taskForm.querySelector("button[type='submit']").textContent = "Save task";
  taskForm.querySelector("h3").textContent = "Create task";
}

async function loadTasks() {
  if (!state.token) {
    taskList.innerHTML = '<p class="empty-state">Login to see your tasks.</p>';
    return;
  }

  const response = await apiRequest("/tasks");
  state.tasks = response.data;
  renderTasks();
}

async function loadAdminUsers() {
  if (!state.user || state.user.role !== "admin") {
    adminPanel.classList.add("hidden");
    userList.innerHTML = "";
    return;
  }

  const response = await apiRequest("/admin/users");
  adminPanel.classList.remove("hidden");
  userList.innerHTML = response.data
    .map(
      (user) => `
        <article class="user-item">
          <strong>${user.name}</strong>
          <p>${user.email}</p>
          <p class="muted">Role: ${user.role} | Tasks: ${user.taskCount}</p>
        </article>
      `
    )
    .join("");
}

function renderTasks() {
  if (!state.tasks.length) {
    taskList.innerHTML = '<p class="empty-state">No tasks yet. Create your first one.</p>';
    return;
  }

  taskList.innerHTML = state.tasks
    .map(
      (task) => `
        <article class="task-item">
          <header>
            <div>
              <h4>${task.title}</h4>
              <p class="muted">${task.description || "No description provided."}</p>
            </div>
            <span class="pill">${task.ownerName}</span>
          </header>
          <div class="task-meta">
            <span class="pill">Status: ${task.status}</span>
            <span class="pill">Priority: ${task.priority}</span>
            <span class="pill">Due: ${task.dueDate ? new Date(task.dueDate).toLocaleString() : "N/A"}</span>
          </div>
          <div class="task-actions">
            <button type="button" class="secondary" data-action="edit" data-task-id="${task.id}">Edit</button>
            <button type="button" data-action="delete" data-task-id="${task.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderSession() {
  if (!state.user) {
    userName.textContent = "Not logged in";
    taskForm.classList.add("hidden");
    adminPanel.classList.add("hidden");
    taskList.innerHTML = '<p class="empty-state">Login to see your tasks.</p>';
    return;
  }

  userName.textContent = `${state.user.name} (${state.user.role})`;
  taskForm.classList.remove("hidden");
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toggleAuthTab(button.dataset.tab);
    hideMessage();
  });
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const formData = new FormData(loginForm);

  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    setAuthenticatedUser(response.data);
    showMessage(response.message);
    loginForm.reset();
    await loadTasks();
    await loadAdminUsers();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const formData = new FormData(registerForm);

  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    setAuthenticatedUser(response.data);
    showMessage(response.message);
    registerForm.reset();
    await loadTasks();
    await loadAdminUsers();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const formData = new FormData(taskForm);
  const values = Object.fromEntries(formData.entries());
  const payload = {
    ...values,
    dueDate: fromLocalDateTimeValue(values.dueDate),
  };

  try {
    const method = state.editingTaskId ? "PATCH" : "POST";
    const path = state.editingTaskId ? `/tasks/${state.editingTaskId}` : "/tasks";
    const response = await apiRequest(path, {
      method,
      body: JSON.stringify(payload),
    });
    showMessage(response.message);
    resetTaskForm();
    await loadTasks();
    await loadAdminUsers();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const taskId = Number(button.dataset.taskId);
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  if (button.dataset.action === "edit") {
    state.editingTaskId = task.id;
    taskForm.title.value = task.title;
    taskForm.description.value = task.description || "";
    taskForm.status.value = task.status;
    taskForm.priority.value = task.priority;
    taskForm.dueDate.value = toLocalDateTimeValue(task.dueDate);
    taskForm.querySelector("button[type='submit']").textContent = "Update task";
    taskForm.querySelector("h3").textContent = "Edit task";
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  try {
    const response = await apiRequest(`/tasks/${taskId}`, {
      method: "DELETE",
    });
    showMessage(response.message);
    if (state.editingTaskId === taskId) {
      resetTaskForm();
    }
    await loadTasks();
    await loadAdminUsers();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

logoutButton.addEventListener("click", () => {
  clearSession();
  renderSession();
  hideMessage();
  resetTaskForm();
});

refreshButton.addEventListener("click", async () => {
  hideMessage();

  try {
    await loadTasks();
    await loadAdminUsers();
    showMessage("Dashboard refreshed.");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

async function bootstrap() {
  renderSession();

  if (!state.token) {
    return;
  }

  try {
    const response = await apiRequest("/auth/me");
    state.user = response.data;
    persistSession();
    renderSession();
    await loadTasks();
    await loadAdminUsers();
  } catch (_error) {
    clearSession();
    renderSession();
  }
}

resetTaskForm();
bootstrap();
