# Fritz - Full-Stack Starter Template

This is a starter template for full-stack applications with Forge&Hive task management, built with a modern monorepo structure using pnpm workspaces.

## 🚀 Getting Started with This Template

After cloning this repository:

1. **Reset Git History** (Optional - for a fresh start):
   ```bash
   git reset $(git commit-tree HEAD^{tree} -m "A new start")
   ```

2. **Point to Your Repository**:
   ```bash
   git remote set-url origin [Your Git repo URL]
   ```

3. **Update Package Configuration**:
   - Update `package.json` files with your new project name and repository
   - Update the project name in `apps/frontend/package.json`
   - Update the project name in `apps/server/package.json`
   - Update workspace references as needed

4. **Remove This Section** and write the documentation for your specific project below.

---

## 📋 Project Structure

This is a full-stack application with a monorepo structure using pnpm workspaces:

- **apps/frontend/**: React Router v7 frontend with TailwindCSS
- **apps/server/**: Express.js API server with TypeScript  
- **packages/forge-sample/**: Forge&Hive task management with sample tasks
- **Root workspace**: Contains shared scripts and dependencies

## 🛠️ Tech Stack

### Frontend
- **React Router v7** with file-based routing
- **TailwindCSS** with custom color palette
- **TypeScript** throughout
- **Vite** for development and building

### Backend
- **Express.js** with TypeScript
- **CORS** enabled for cross-origin requests
- **In-memory storage** (easily replaceable with database)

### Task Management
- **Forge&Hive** for structured task execution
- **Schema validation** with input/output validation
- **Boundary pattern** for external dependencies

## 🚀 Development Commands

### Start Everything
```bash
pnpm dev          # Start all apps in development mode
```

### Individual Services
```bash
# Frontend (http://localhost:5173)
cd apps/frontend && pnpm dev

# Backend (http://localhost:4001)
cd apps/server && pnpm dev

# Forge&Hive tasks
cd packages/forge-sample && forge task:run [namespace:taskName]
```

### Build & Test
```bash
pnpm build        # Build all apps for production
pnpm test         # Run tests across all apps
pnpm lint         # Lint all apps
pnpm clean        # Clean build artifacts
```

## 📁 Key Directories

```
fritz/
├── apps/
│   ├── frontend/           # React Router v7 app
│   │   ├── app/
│   │   │   ├── routes/     # File-based routing
│   │   │   ├── components/ # Shared UI components
│   │   │   ├── actions/    # Client-side actions
│   │   │   └── lib/        # Utilities (taskToAction helper)
│   │   └── react-router.config.ts
│   └── server/             # Express.js API
│       └── src/
│           └── index.ts    # Main server entry
├── packages/
│   └── forge-sample/       # Forge&Hive tasks
│       ├── tasks/          # Task implementations
│       └── forge.json      # Task configuration
└── docs/
    └── forge.md           # Forge&Hive documentation
```

## 🎨 Custom Design System

The frontend uses a custom TailwindCSS color palette:

- **Navy** (`navy-500: #1c3547`): Primary brand color
- **Gray** (`gray-500: #3e5152`): Text and backgrounds  
- **Yellow** (`yellow-500: #dc991b`): Golden highlights
- **Orange** (`orange-500: #ea870a`): Secondary actions
- **Red** (`red-500: #df553f`): Alerts and important actions

## 🔧 API Endpoints

The Express server provides these endpoints:

- `GET /api` - Health check
- `GET /api/health` - Detailed health status
- `GET /api/counters` - List all counters
- `GET /api/counter/:uuid` - Get specific counter
- `POST /api/counter/:uuid` - Increment counter
- `DELETE /api/counter/:uuid` - Delete counter

## 📋 Forge&Hive Task Management

This project includes Forge&Hive for structured task execution. Tasks follow the "Task and Boundaries" pattern:

### Create a Task
```bash
cd packages/forge-sample
forge task:create namespace:taskName
```

### Run a Task
```bash
# With direct flags
forge task:run namespace:taskName --param="value"

# With JSON input
forge task:run namespace:taskName --input='{"param":"value"}'
```

### Frontend Integration
Tasks are integrated into the frontend using the `taskToAction` helper pattern:

```typescript
import { taskToAction } from '~/lib/taskToAction'
import { myTask } from '@your-package/forge-sample'

const action = taskToAction(myTask)
const result = await action({ param: 'value' })

if (result.success) {
  console.log('Task completed:', result.data)
} else {
  console.error('Task failed:', result.error)
}
```

## 📚 Documentation

- **[Forge&Hive Guide](./docs/forge.md)** - Complete guide to task management
- **[Project Instructions](./CLAUDE.md)** - Development guidelines and architecture

## 🌐 Environment

- **Frontend**: http://localhost:5173 (dev) / http://localhost:3000 (prod)
- **Backend**: http://localhost:4001
- **Package Manager**: pnpm with workspaces

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Hive credentials and project UUID

# Start development servers
pnpm dev
```

## 🔧 Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Hive SDK Configuration (VITE_ prefix required for client-side access)
VITE_HIVE_PROJECT_NAME=Fritz Application
VITE_HIVE_API_KEY=your_api_key_here
VITE_HIVE_API_SECRET=your_api_secret_here
VITE_HIVE_HOST=https://www.forgehive.cloud

# Project Configuration
VITE_PROJECT_UUID=fritz-project-uuid-here
VITE_NODE_ENV=development

# Server-side environment variables
NODE_ENV=development
```

Get your Hive API credentials at [https://www.forgehive.cloud](https://www.forgehive.cloud)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
cd apps/frontend && pnpm test
cd apps/server && pnpm test
```

## 🔨 Building

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/frontend && pnpm build
cd apps/server && pnpm build
```

## 🚢 Deployment

The project includes Docker support for the frontend and can be deployed to various platforms:

- **Frontend**: Static build output can be deployed to Vercel, Netlify, etc.
- **Backend**: Express server can be deployed to Railway, Render, Heroku, etc.
- **Forge&Hive Tasks**: Can be published to task registries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.