# Creating Basic Packages

This guide shows how to create a simple package structure in the monorepo that can be extended with your own functionality.

## 🚀 Quick Package Setup

### 1. Create Package Directory

```bash
mkdir packages/your-package-name
cd packages/your-package-name
```

### 2. Create package.json

```json
{
  "name": "@fritz/your-package-name",
  "version": "1.0.0",
  "description": "Your package description",
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
    "prepublishOnly": "pnpm run clean && pnpm run build"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.12.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 3. Create tsconfig.json

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

### 4. Create src/index.ts

```typescript
// Export a simple greeting function
export const greeting = "Hello from your new package!";

export function sayHello(name: string): string {
  return `${greeting} Welcome, ${name}!`;
}
```

### 5. Build the Package

```bash
pnpm build
```

## 📁 Final Structure

Your package will have this structure:

```
packages/your-package-name/
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration  
├── src/
│   └── index.ts         # Main export file
└── dist/                # Compiled output (after build)
    └── src/
        ├── index.js
        └── index.d.ts
```

## 🔧 Using Your Package

### In Other Packages

Add to package.json dependencies:
```json
{
  "dependencies": {
    "@fritz/your-package-name": "workspace:*"
  }
}
```

Then import:
```typescript
import { sayHello } from '@fritz/your-package-name';

console.log(sayHello('World'));
```

### Adding Forge&Hive Tasks

If you want to add Forge&Hive tasks to your package:

1. Add dependencies to your package.json:
```json
{
  "dependencies": {
    "@forgehive/schema": "^0.1.4",
    "@forgehive/task": "^0.2.5"
  }
}
```

2. Create `forge.json`:
```json
{
  "name": "@fritz/your-package-name",
  "version": "1.0.0",
  "tasks": {}
}
```

3. Use the forge CLI to create tasks:
```bash
forge task:create my:task
```

## 📚 Next Steps

From this basic structure, you can:

- Add business logic and data models
- Create Forge&Hive tasks for specific operations  
- Add storage layers (JSON files, databases, etc.)
- Implement API clients or external integrations
- Add comprehensive TypeScript types for LLM consumption

The simple structure gives you flexibility to build exactly what you need without unnecessary complexity.