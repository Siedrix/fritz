# Creating LLM-Friendly Packages with Forge&Hive

This guide explains how to create well-structured packages that are optimized for Large Language Model (LLM) usage, based on the patterns established in this project. These packages combine Forge&Hive task management with clear APIs, proper TypeScript types, and LLM-friendly documentation.

## 📋 Package Architecture Overview

A well-designed LLM package follows this structure:

```
packages/your-package/
├── package.json              # Package configuration
├── tsconfig.json            # TypeScript configuration
├── forge.json               # Forge&Hive task registry
├── src/
│   ├── index.ts            # Main export file
│   ├── models/             # Data models and business logic
│   │   ├── index.ts        # Model exports and singletons
│   │   └── [entity].ts     # Individual entity models
│   ├── lib/                # Utilities and helpers
│   │   └── storage.ts      # Data persistence layer
│   └── tasks/              # Forge&Hive task implementations
│       └── [namespace]/    # Task groupings by domain
│           ├── create.ts   # CRUD operations
│           ├── list.ts
│           ├── get.ts
│           ├── update.ts
│           └── remove.ts
├── db/                     # Local data storage (JSON files)
├── logs/                   # Task execution logs
└── dist/                   # Compiled output (auto-generated)
```

## 🚀 Step-by-Step Package Creation

### 1. Initialize Package Structure

Create a new package directory in your monorepo:

```bash
mkdir packages/your-package
cd packages/your-package
```

### 2. Setup package.json

Create a `package.json` with the essential configuration:

```json
{
  "name": "@your-scope/your-package",
  "version": "1.0.0",
  "description": "Forge&Hive tasks for [your domain] management",
  "type": "module",
  "main": "dist/src/index.js",
  "types": "dist/src/index.d.ts",
  "files": [
    "dist/**/*"
  ],
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run clean && npm run build",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["forgehive", "tasks", "llm"],
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    "@forgehive/schema": "^0.1.4",
    "@forgehive/task": "^0.2.5",
    "dotenv": "^16.4.5",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.12.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 3. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Initialize Forge&Hive

Create `forge.json`:

```json
{
  "name": "@your-scope/your-package",
  "version": "1.0.0",
  "tasks": {}
}
```

### 5. Create Data Models

Create `src/models/[entity].ts` - Example for a "User" entity:

```typescript
import fs from 'fs/promises'
import path from 'path'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export class UserStorage {
  constructor(private dbPath: string) {}

  async loadUsers(): Promise<Record<string, User>> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // Return empty object if file doesn't exist
      return {}
    }
  }

  async saveUsers(users: Record<string, User>): Promise<void> {
    // Ensure directory exists
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true })
    await fs.writeFile(this.dbPath, JSON.stringify(users, null, 2))
  }
}

export class UserManager {
  constructor(private storage: UserStorage) {}

  async userExists(id: string): Promise<boolean> {
    const users = await this.storage.loadUsers()
    return id in users
  }

  async generateId(name: string): Promise<string> {
    // Simple slug generation - replace with your logic
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-')
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = await this.generateId(userData.name)
    const now = new Date().toISOString()
    
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    }

    const users = await this.storage.loadUsers()
    users[id] = user
    await this.storage.saveUsers(users)

    return user
  }

  // Add other CRUD methods as needed...
}
```

### 6. Create Model Index with Singletons

Create `src/models/index.ts`:

```typescript
import path from 'path'
import { config } from 'dotenv'
import { UserStorage, UserManager } from './user.js'

// Load environment variables
const packageRoot = process.cwd()
config({ path: path.join(packageRoot, '.env') })

// Database configuration
const dbPath = process.env.DB_PATH || path.join(packageRoot, 'db')
const usersDbFile = process.env.USERS_DB_FILE || 'users.json'
const usersDbPath = path.join(dbPath, usersDbFile)

// Singleton instances
let userStorageInstance: UserStorage | null = null
let userManagerInstance: UserManager | null = null

export function getUserStorage(): UserStorage {
  if (!userStorageInstance) {
    userStorageInstance = new UserStorage(usersDbPath)
  }
  return userStorageInstance
}

export function getUserManager(): UserManager {
  if (!userManagerInstance) {
    const storage = getUserStorage()
    userManagerInstance = new UserManager(storage)
  }
  return userManagerInstance
}

// Re-export types and classes
export * from './user.js'
```

### 7. Create Forge&Hive Tasks

Create `src/tasks/user/create.ts`:

```typescript
// TASK: create
// Run this task with:
// forge task:run user:create

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import { getUserManager } from '../../models/index.js'
import type { User } from '../../models/user.js'

const userManager = getUserManager()

const name = 'user:create'
const description = 'Create a new user with specified name and email'

const schema = new Schema({
  name: Schema.string().describe('User full name'),
  email: Schema.string().email().describe('User email address'),
  metadata: Schema.record(Schema.string()).optional().describe('Additional user metadata')
})

const boundaries = {
  userExists: async (id: string) => {
    return userManager.userExists(id)
  },
  generateId: async (name: string) => {
    return userManager.generateId(name)
  },
  createUser: async (userData: any) => {
    return userManager.createUser(userData)
  }
}

export const create = createTask({
  name,
  description,
  schema,
  boundaries,
  fn: async function ({ name, email, metadata }, { userExists, generateId, createUser }) {
    // Generate ID from name
    const id = await generateId(name)

    // Check if user already exists
    const exists = await userExists(id)
    if (exists) {
      throw new Error(`User with name "${name}" already exists`)
    }

    // Create user
    const user = await createUser({ name, email, metadata })

    return {
      message: `User "${name}" created successfully`,
      data: user
    }
  }
})
```

Create similar tasks for other CRUD operations: `list.ts`, `get.ts`, `update.ts`, `remove.ts`.

### 8. Create Main Export File

Create `src/index.ts`:

```typescript
// Export all models and types for external use
export * from './models/index.js'
export * from './models/user.js'

// Export task functions with descriptive names
export { create as createUserTask } from './tasks/user/create.js'
export { list as listUsersTask } from './tasks/user/list.js'
export { get as getUserTask } from './tasks/user/get.js'
export { update as updateUserTask } from './tasks/user/update.js'
export { remove as removeUserTask } from './tasks/user/remove.js'
```

### 9. Register Tasks with Forge&Hive

Run the following commands to register your tasks:

```bash
# Create tasks using forge CLI
forge task:create user:create
forge task:create user:list
forge task:create user:get
forge task:create user:update
forge task:create user:remove

# The tasks will be automatically registered in forge.json
```

### 10. Build and Test

```bash
# Build the package
npm run build

# Test a task
forge task:run user:create --name="John Doe" --email="john@example.com"

# List all users
forge task:run user:list
```

## 🎯 LLM-Friendly Best Practices

### 1. Clear Naming Conventions

- **Tasks**: Use `namespace:action` format (e.g., `user:create`, `portfolio:addTransaction`)
- **Exports**: Use descriptive names with `Task` suffix (e.g., `createUserTask`, `addTransactionTask`)
- **Types**: Export all interfaces and types for external use

### 2. Comprehensive Type Definitions

```typescript
// Always export interfaces for LLM consumption
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

// Export result types for task outputs
export interface UserCreationResult {
  message: string
  data: User
}
```

### 3. Detailed Schema Descriptions

```typescript
const schema = new Schema({
  name: Schema.string()
    .describe('User full name - must be unique within the system'),
  email: Schema.string()
    .email()
    .describe('Valid email address for user notifications'),
  age: Schema.number()
    .min(13)
    .max(120)
    .optional()
    .describe('User age in years (optional, must be 13-120)')
})
```

### 4. Consistent Error Handling

```typescript
// Always throw descriptive errors
if (exists) {
  throw new Error(`User with name "${name}" already exists. Please choose a different name.`)
}

// Provide helpful context in error messages
if (!user) {
  throw new Error(`User with ID "${id}" not found. Available users: ${availableIds.join(', ')}`)
}
```

### 5. Rich Return Data

```typescript
// Always return both message and data
return {
  message: `User "${name}" created successfully`,
  data: {
    user,
    totalUsers: Object.keys(users).length,
    createdAt: user.createdAt
  }
}
```

## 📦 Frontend Integration

Your package can be easily integrated into frontend applications using the `taskToAction` pattern:

```typescript
// In your frontend actions file
import { taskToAction, type ActionResult } from '~/lib/taskToAction'
import { createUserTask, type User } from '@your-scope/your-package'

export interface CreateUserData {
  name: string
  email: string
  metadata?: Record<string, string>
}

export async function createUser(data: CreateUserData): Promise<ActionResult<User>> {
  const action = taskToAction<User>(createUserTask)
  return await action(data)
}
```

## 🔧 Advanced Patterns

### Environment Configuration

Create `.env` file for your package:

```env
DB_PATH=./db
USERS_DB_FILE=users.json
LOG_LEVEL=info
```

### Custom Storage Backends

```typescript
// Abstract storage interface for different backends
export interface StorageBackend<T> {
  load(): Promise<Record<string, T>>
  save(data: Record<string, T>): Promise<void>
}

// JSON file storage
export class JsonStorage<T> implements StorageBackend<T> {
  constructor(private filePath: string) {}
  // Implementation...
}

// Could be extended with DatabaseStorage, S3Storage, etc.
```

### Validation Helpers

```typescript
// Create reusable validation schemas
export const CommonSchemas = {
  email: Schema.string().email().describe('Valid email address'),
  slug: Schema.string().regex(/^[a-z0-9-]+$/).describe('URL-safe slug'),
  timestamp: Schema.string().datetime().describe('ISO timestamp'),
  currency: Schema.number().min(0).describe('Currency amount (non-negative)')
}
```

## 📚 Documentation Requirements

Every LLM package should include:

1. **Clear README.md** with usage examples
2. **Type definitions** exported from index.ts
3. **Task descriptions** in schema definitions
4. **Error message patterns** that are helpful and actionable
5. **Example usage** in both CLI and programmatic contexts

## 🚀 Publishing Your Package

```bash
# Build the package
npm run build

# Publish to npm (if desired)
npm publish

# Or link locally for development
npm link
```

## 🔄 Integration with Existing Projects

To use your package in a frontend application:

1. **Install the package**: `pnpm add @your-scope/your-package`
2. **Import tasks**: `import { createUserTask } from '@your-scope/your-package'`
3. **Use with taskToAction**: Create action functions using the established pattern
4. **Type safety**: Import and use TypeScript interfaces for full type safety

This architecture provides LLMs with clear, predictable APIs while maintaining the benefits of Forge&Hive's task management system. The separation of concerns between models, storage, and tasks makes the code easy to understand and extend.