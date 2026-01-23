# Todo API - NestJS Backend

RESTful API for the Todo application with JWT authentication, pagination, and Swagger documentation.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black)

## Table of Contents

- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Architecture](#architecture)

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`.

### Environment Setup

Create a `.env` file in the backend directory:

```env
PORT=3000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-secret-key-here
```

## API Documentation

Interactive Swagger documentation is available at `http://localhost:3000/api` when the server is running.

### Auth Endpoints

| Method | Endpoint        | Description                    | Auth Required |
| ------ | --------------- | ------------------------------ | ------------- |
| POST   | `/auth/register` | Register a new user           | No            |
| POST   | `/auth/login`    | Login and get tokens          | No            |
| GET    | `/auth/me`       | Get current user info         | Access Token  |
| POST   | `/auth/refresh`  | Refresh access token          | Refresh Token |
| POST   | `/auth/logout`   | Logout (invalidate token)     | Refresh Token |
| POST   | `/auth/logout-all` | Logout from all devices     | Access Token  |

### Todo Endpoints

All todo endpoints require a valid access token in the `Authorization` header.

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| POST   | `/todos`      | Create a new todo     |
| GET    | `/todos`      | Get paginated todos   |
| GET    | `/todos/:id`  | Get a specific todo   |
| PATCH  | `/todos/:id`  | Update a todo         |
| DELETE | `/todos/:id`  | Delete a todo         |

### Query Parameters for GET /todos

| Parameter   | Type    | Default | Description                          |
| ----------- | ------- | ------- | ------------------------------------ |
| `page`      | number  | 1       | Page number (1-indexed)              |
| `limit`     | number  | 10      | Items per page (1-100)               |
| `completed` | boolean | -       | Filter by completion status          |
| `search`    | string  | -       | Search todos by title (case-insensitive) |
| `sortOrder` | string  | desc    | Sort by creation date (`asc` or `desc`) |

**Example:** `GET /todos?page=1&limit=20&completed=false&search=groceries&sortOrder=asc`

## Authentication

### Token Flow

```
┌─────────┐     POST /auth/login      ┌─────────┐
│  Client │ ─────────────────────────▶│   API   │
└─────────┘                           └─────────┘
     │                                      │
     │   { accessToken, refreshToken }      │
     │◀─────────────────────────────────────│
     │                                      │
     │   GET /todos (Bearer accessToken)    │
     │─────────────────────────────────────▶│
     │                                      │
     │   { data: [...], meta: {...} }       │
     │◀─────────────────────────────────────│
     │                                      │
     │   POST /auth/refresh (refreshToken)  │
     │─────────────────────────────────────▶│
     │                                      │
     │   { accessToken, refreshToken }      │
     │◀─────────────────────────────────────│
```

### Example Requests

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Create Todo (authenticated):**
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

**Get Todos with filters:**
```bash
curl "http://localhost:3000/todos?page=1&limit=10&completed=false" \
  -H "Authorization: Bearer <access_token>"
```

## Database Schema

### User

| Field     | Type     | Description              |
| --------- | -------- | ------------------------ |
| id        | Int      | Primary key              |
| email     | String   | Unique email address     |
| password  | String   | Hashed password          |
| createdAt | DateTime | Account creation time    |

### Todo

| Field       | Type     | Description              |
| ----------- | -------- | ------------------------ |
| id          | Int      | Primary key              |
| title       | String   | Todo title               |
| description | String?  | Optional description     |
| completed   | Boolean  | Completion status        |
| createdAt   | DateTime | Creation timestamp       |
| updatedAt   | DateTime | Last update timestamp    |
| userId      | Int?     | Foreign key to User      |

### RefreshToken

| Field     | Type     | Description              |
| --------- | -------- | ------------------------ |
| id        | Int      | Primary key              |
| token     | String   | Unique refresh token     |
| userId    | Int      | Foreign key to User      |
| expiresAt | DateTime | Token expiration time    |
| createdAt | DateTime | Token creation time      |

## Environment Variables

| Variable      | Description                          | Required |
| ------------- | ------------------------------------ | -------- |
| `PORT`        | Server port (default: 3000)          | No       |
| `DATABASE_URL` | SQLite database file path           | Yes      |
| `JWT_SECRET`  | Secret key for JWT signing           | Yes      |

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Architecture

```
src/
├── auth/                    # Authentication module
│   ├── auth.controller.ts   # Auth route handlers
│   ├── auth.service.ts      # Auth business logic
│   ├── auth.module.ts       # Module definition
│   └── dto/                 # Data transfer objects
├── todo/                    # Todo CRUD module
│   ├── todo.controller.ts   # Todo route handlers
│   ├── todo.service.ts      # Todo business logic
│   ├── todo.module.ts       # Module definition
│   └── dto/                 # DTOs and validation
├── common/                  # Shared utilities
│   ├── guards/              # Auth guards
│   ├── decorators/          # Custom decorators
│   └── filters/             # Exception filters
├── prisma/                  # Database service
│   └── prisma.service.ts    # Prisma client wrapper
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```
