module.exports = {
  openapi: "3.0.3",
  info: {
    title: "TaskFlow API",
    version: "1.0.0",
    description:
      "Assignment submission API with JWT authentication, role-based access control, and task CRUD operations.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Tasks" },
    { name: "Admin" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              statusCode: { type: "integer", example: 400 },
              message: { type: "string", example: "Validation failed." },
              details: { nullable: true },
            },
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Asha Sharma" },
          email: { type: "string", format: "email", example: "asha@example.com" },
          password: { type: "string", example: "StrongPass1" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "asha@example.com" },
          password: { type: "string", example: "StrongPass1" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login successful." },
          data: {
            type: "object",
            properties: {
              token: { type: "string" },
              user: { $ref: "#/components/schemas/User" },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 2 },
          name: { type: "string", example: "Asha Sharma" },
          email: { type: "string", example: "asha@example.com" },
          role: { type: "string", enum: ["admin", "user"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Prepare project README" },
          description: { type: "string", nullable: true, example: "Add setup steps and API docs." },
          status: { type: "string", enum: ["todo", "in-progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          dueDate: { type: "string", nullable: true, format: "date-time" },
          ownerId: { type: "integer", example: 2 },
          ownerName: { type: "string", example: "Asha Sharma" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TaskRequest: {
        type: "object",
        required: ["title", "status", "priority"],
        properties: {
          title: { type: "string", example: "Ship backend assignment" },
          description: { type: "string", example: "Finish docs and frontend polish." },
          status: { type: "string", enum: ["todo", "in-progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          dueDate: {
            type: "string",
            nullable: true,
            format: "date-time",
            example: "2026-04-28T18:30:00.000Z",
          },
        },
      },
    },
  },
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service is healthy.",
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a standard user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Registration successful.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          409: {
            description: "Email already exists.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate a user and receive a JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Fetch the currently logged-in user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User profile returned.",
          },
          401: {
            description: "Token missing or invalid.",
          },
        },
      },
    },
    "/api/v1/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        description:
          "Standard users only see their own tasks. Admins can see all tasks and optionally filter by status.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["todo", "in-progress", "done"],
            },
          },
        ],
        responses: {
          200: {
            description: "Task list returned.",
          },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Task created successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Task" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Fetch a task by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Task returned." },
          404: { description: "Task not found." },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update a task",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskRequest" },
            },
          },
        },
        responses: {
          200: { description: "Task updated successfully." },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Task deleted successfully." },
        },
      },
    },
    "/api/v1/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List registered users",
        description: "Admin-only endpoint that summarizes all users and their task counts.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User list returned." },
          403: { description: "Forbidden." },
        },
      },
    },
  },
};
