# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack application called "Delphi" (formerly "Fritz") with a monorepo structure using pnpm workspaces:

- **apps/frontend/**: React Router v7 frontend with TailwindCSS for ticker management
- **apps/server/**: Express.js API server with TypeScript
- **packages/forge-sample/**: ForgeHive task management with stock price fetching
- **Root workspace**: Contains shared scripts and dependencies

The application is a ticker management system where users can add stock tickers and fetch their current prices on the home page.

## Common Development Commands

### Root Level (All Apps)
```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps for production
pnpm test         # Run tests across all apps
pnpm lint         # Lint all apps
pnpm clean        # Clean build artifacts from all apps
```

### Frontend (apps/frontend/)
```bash
cd apps/frontend
pnpm dev          # Start React Router dev server (http://localhost:5173)
pnpm build        # Build for production using react-router build
pnpm start        # Start production server
pnpm typecheck    # Run TypeScript type checking with react-router typegen
```

### Server (apps/server/)
```bash
cd apps/server
pnpm dev          # Start Express server with tsx watch (http://localhost:4001)
pnpm build        # Compile TypeScript to dist/
pnpm start        # Run compiled server from dist/
pnpm clean        # Remove dist/ directory
```

## Architecture Overview

### Frontend Architecture
- **React Router v7** with file-based routing
- **Route structure**: 
  - `/` (home) → `routes/home.tsx`
  - `/rooms/:uuid` → `routes/rooms.$uuid.tsx`
- **Components**: Shared UI components in `app/components/`
- **Actions**: Client-side actions in `app/actions/`
- **Styling**: TailwindCSS with custom color palette (see `specs/color-palette.md`)

### Backend Architecture
- **Express.js** server with CORS enabled
- **In-memory storage** for counter data (no database)
- **API endpoints**:
  - `GET /api` - Health check
  - `GET /api/health` - Detailed health status
  - `GET /api/counters` - List all counters
  - `GET /api/counter/:uuid` - Get specific counter (creates if doesn't exist)
  - `POST /api/counter/:uuid` - Increment counter
  - `DELETE /api/counter/:uuid` - Delete counter

### Custom Color Palette
The frontend uses a custom TailwindCSS color palette with:
- **Navy**: Primary brand color (`navy-500: #1c3547`)
- **Gray**: Text and backgrounds (`gray-500: #3e5152`)
- **Yellow**: Golden highlights (`yellow-500: #dc991b`)
- **Orange**: Secondary actions (`orange-500: #ea870a`)
- **Red**: Alerts and important actions (`red-500: #df553f`)

## ForgeHive Task Management

This project includes ForgeHive task management in `packages/forge-sample/`. Always use the official forge CLI commands:

### Task Management Commands
```bash
cd packages/forge-sample

# Create a new task
forge task:create namespace:taskName

# Run a task
forge task:run namespace:taskName --input='{"param":"value"}'
# OR with direct flags
forge task:run namespace:taskName --param="value"

# Remove a task (removes from forge.json and filesystem)
forge task:remove namespace:taskName

# Publish a task
forge task:publish namespace:taskName
```

**Important**: Never manually delete task files with `rm` - always use `forge task:remove` to properly clean up both the filesystem and configuration.

## Development Notes

- Uses **pnpm** as package manager with workspace configuration
- Frontend runs on port **5173** (dev) / **3000** (production)
- Backend runs on port **4001** (configurable via PORT env var)
- TypeScript throughout with proper type definitions
- Docker support available for frontend deployment

## Hive SDK Integration

The application integrates with Forge&Hive logging platform via the `taskToAction` helper:

- **Automatic Logging**: All task executions are automatically logged to Hive
- **Environment Variables**: Configure via `.env` file with project UUID and API credentials
- **Silent Mode**: Falls back gracefully if credentials are not provided

Environment variables:
```env
HIVE_PROJECT_NAME=Fritz Application
HIVE_API_KEY=your_api_key_here
HIVE_API_SECRET=your_api_secret_here 
PROJECT_UUID=your_project_uuid_here
```

## Key Files
- `pnpm-workspace.yaml`: Workspace configuration
- `apps/frontend/react-router.config.ts`: React Router configuration
- `apps/frontend/app/routes.ts`: Route definitions
- `apps/server/src/index.ts`: Main server entry point
- `apps/frontend/app/lib/taskToAction.ts`: Hive SDK integration helper