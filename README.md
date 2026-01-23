# Todo App

A full-stack todo application built with NestJS and React, featuring authentication, pagination, search, and filtering.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Documentation](#documentation)
- [License](#license)

## Features

- [x] User authentication (register, login, logout)
- [x] JWT-based auth with refresh tokens
- [x] CRUD operations for todos
- [x] Pagination with customizable page size
- [x] Search todos by title
- [x] Filter by completion status
- [x] Sort by creation date
- [x] Rate limiting protection
- [x] Swagger API documentation
- [x] Responsive UI with Tailwind CSS

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Backend  | NestJS 11, Prisma ORM, SQLite, JWT, Swagger |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4  |
| Tooling  | npm workspaces, ESLint, Prettier, Jest      |

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nest-todo

# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your JWT_SECRET

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Start development servers
npm run dev
```

### URLs

| Service  | URL                       |
| -------- | ------------------------- |
| Frontend | http://localhost:5173     |
| Backend  | http://localhost:3000     |
| Swagger  | http://localhost:3000/api |

## Project Structure

```
nest-todo/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── todo/           # Todo CRUD module
│   │   ├── common/         # Guards, decorators, filters
│   │   └── prisma/         # Database service
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── test/               # E2E tests
├── frontend/               # React SPA
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # UI components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
└── package.json           # Root workspace config
```

## Available Scripts

Run from the project root:

| Script                   | Description                                 |
| ------------------------ | ------------------------------------------- |
| `npm run dev`            | Start both backend and frontend in dev mode |
| `npm run dev:backend`    | Start only the backend server               |
| `npm run dev:frontend`   | Start only the frontend dev server          |
| `npm run build`          | Build both projects for production          |
| `npm run test`           | Run tests in all workspaces                 |
| `npm run lint`           | Run ESLint in all workspaces                |
| `npm run prisma:studio`  | Open Prisma Studio database viewer          |
| `npm run prisma:migrate` | Run database migrations                     |

## Documentation

- [Backend API Documentation](./backend/README.md) - API endpoints, authentication, database schema
- [Frontend Documentation](./frontend/README.md) - Components, API integration, styling

## License

This project is [MIT](LICENSE) licensed.
