# Todo App - React Frontend

React single-page application for managing todos with authentication, pagination, search, and filtering.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Project Structure](#project-structure)
- [Components](#components)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

## Features

- User registration and login
- Automatic token refresh
- Create, read, update, delete todos
- Pagination with page size control
- Search todos by title
- Filter by completion status
- Sort by creation date (newest/oldest)
- Responsive design
- Loading and error states

## Project Structure

```
src/
├── api/                    # API client and functions
│   ├── client.ts          # Fetch wrapper with auth
│   ├── auth.ts            # Auth API functions
│   └── todos.ts           # Todo API functions
├── components/            # Reusable UI components
│   ├── auth-form.tsx      # Login/register form
│   ├── todo-form.tsx      # Create/edit todo form
│   ├── todo-item.tsx      # Individual todo display
│   ├── todo-list.tsx      # Todo list container
│   ├── todo-filters.tsx   # Search, filter, sort controls
│   └── pagination.tsx     # Pagination controls
├── context/               # React context providers
│   └── auth-context.tsx   # Authentication state
├── pages/                 # Page components
│   ├── auth-page.tsx      # Login/register page
│   └── todo-page.tsx      # Main todo management page
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared types
├── App.tsx               # Root component with routing
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## Components

| Component      | Description                                          |
| -------------- | ---------------------------------------------------- |
| `AuthForm`     | Handles login and registration with form validation  |
| `TodoForm`     | Form for creating new todos                          |
| `TodoItem`     | Displays a single todo with toggle and delete actions |
| `TodoList`     | Container that renders the list of todos             |
| `TodoFilters`  | Search input, completion filter, and sort controls   |
| `Pagination`   | Page navigation with current page and total info     |

## API Integration

The frontend uses a custom fetch wrapper that handles authentication automatically.

### Auth Context

```tsx
import { useAuth } from './context/auth-context';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  // Use auth state and methods
}
```

### API Client Usage

```tsx
import { getTodos, createTodo, updateTodo, deleteTodo } from './api/todos';

// Get paginated todos with filters
const response = await getTodos({
  page: 1,
  limit: 10,
  completed: false,
  search: 'groceries',
  sortOrder: 'desc'
});

// Create a new todo
const newTodo = await createTodo({
  title: 'Buy milk',
  description: 'From the grocery store'
});

// Update a todo
const updated = await updateTodo(todoId, {
  completed: true
});

// Delete a todo
await deleteTodo(todoId);
```

### Response Types

```typescript
interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

## Styling

This project uses Tailwind CSS 4 for styling with the Vite plugin for automatic CSS processing.

### Configuration

Tailwind is configured via the Vite plugin in `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Usage

Apply utility classes directly in components:

```tsx
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click me
</button>
```

## Environment Variables

| Variable        | Description                    | Required |
| --------------- | ------------------------------ | -------- |
| `VITE_API_URL`  | Backend API base URL           | Yes      |

Note: All Vite environment variables must be prefixed with `VITE_` to be exposed to the client.

## Scripts

| Script          | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Start development server with hot reload       |
| `npm run build` | Type-check and build for production            |
| `npm run lint`  | Run ESLint to check for code issues            |
| `npm run preview` | Preview production build locally             |
