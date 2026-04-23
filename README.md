# TaskFlow Assignment Submission

TaskFlow is a backend-focused assignment project that demonstrates a complete authentication and task management system. It includes a versioned REST API, JWT-based authorization, role-based access control, documented endpoints, a lightweight frontend, and supporting submission assets for review.

## What This Project Covers

- User registration and login
- Password hashing with `bcryptjs`
- JWT authentication for protected routes
- Role-based access control with `user` and `admin`
- CRUD operations for a secondary entity: `tasks`
- Swagger API documentation
- Postman collection for manual testing
- Basic frontend for trying the flows quickly
- PostgreSQL schema and scalability notes for production direction

## Tech Stack

- Node.js
- Express
- bcryptjs
- jsonwebtoken
- Swagger UI Express
- Vanilla JavaScript

## Core Features

- `POST /api/v1/auth/register` registers a standard user
- `POST /api/v1/auth/login` authenticates a user and returns a JWT
- `GET /api/v1/auth/me` returns the current authenticated user
- `GET /api/v1/tasks` lists tasks
- `POST /api/v1/tasks` creates a task
- `PATCH /api/v1/tasks/:id` updates a task
- `DELETE /api/v1/tasks/:id` deletes a task
- `GET /api/v1/admin/users` returns all users for admin accounts only

## Project Structure

```text
.
|-- data
|-- docs
|-- public
|-- src
|   |-- controllers
|   |-- data
|   |-- docs
|   |-- lib
|   |-- middleware
|   `-- routes
|-- tests
|-- server.js
`-- package.json
```

## How The System Works

The application starts from `server.js`, loads the Express app, initializes the local datastore, and starts the server.

The backend is organized into:

- `routes` for endpoint definitions
- `controllers` for business logic
- `middleware` for authentication, authorization, and error handling
- `lib` for helpers like validation, JWT handling, and password hashing
- `data` for persistence logic

The frontend in `public/` talks directly to the REST API using `fetch`, stores the token locally for the demo flow, and allows login, registration, task creation, update, deletion, and admin inspection.

## Authentication And Authorization Flow

1. A user registers or logs in through `/api/v1/auth/register` or `/api/v1/auth/login`.
2. The backend validates the payload and hashes passwords before storing them.
3. On successful login or registration, the backend returns a JWT.
4. The client includes that JWT in the `Authorization: Bearer <token>` header.
5. Protected routes use auth middleware to verify the token and attach the current user to the request.
6. Admin-only routes apply an additional role check before the controller runs.

## Task Flow

1. An authenticated user creates a task through `POST /api/v1/tasks`.
2. The backend validates fields such as `title`, `status`, `priority`, and `dueDate`.
3. The task is stored with the current user as its owner.
4. Standard users only see and manage their own tasks.
5. Admin users can view all tasks and access user summaries.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Optional: review environment variables:

```bash
copy .env.example .env
```

3. Start the server:

```bash
npm start
```

4. Open the project:

- App UI: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

## Default Admin Credentials

The project seeds an admin account on first startup so the role-based flow can be tested immediately.

- Email: `admin@example.com`
- Password: `Admin@12345`

## API Documentation And Submission Assets

- Swagger docs: `/docs`
- OpenAPI JSON: `/openapi.json`
- Postman collection: [docs/postman_collection.json](./docs/postman_collection.json)
- PostgreSQL schema: [docs/postgresql-schema.sql](./docs/postgresql-schema.sql)
- Scalability note: [docs/scalability-note.md](./docs/scalability-note.md)

## Validation And Security

- Passwords are hashed using `bcryptjs`
- JWTs protect all task and admin endpoints
- Inputs are validated before business logic runs
- Role-based restrictions are enforced for admin-only routes
- Error responses are standardized through centralized middleware

## Persistence Note

For easy local review, this submission uses a JSON datastore at `data/db.json`. A production-oriented PostgreSQL schema is also included in [docs/postgresql-schema.sql](./docs/postgresql-schema.sql), along with a short scaling plan in [docs/scalability-note.md](./docs/scalability-note.md).


