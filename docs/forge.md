# LLM Guide: Forge&Hive Task Management (v0)

This guide explains how to create, run, publish, and remove tasks in applications using Forge&Hive. It's designed for Large Language Models (LLMs) working on projects that have Forge&Hive integrated as a task management system.

**Note**: This documentation is specifically for the CLI-based task management system. Task names and structure are based on the `@forgehive/task` package.

**Package Versions:**
- `@forgehive/forge-cli`: v0.3.8
- `@forgehive/task`: v0.2.5

## Overview

Forge&Hive uses a "Task and Boundaries" pattern where:
- **Tasks** are black boxes with validated inputs/outputs using schemas
- **Boundaries** are explicit interfaces to external dependencies (databases, APIs, file system, etc.)
- All external calls (network requests, file operations, non-deterministic operations) must go through boundaries

## Task Structure

Every task follows this pattern:

```typescript
import { createTask } from '@forgehive/task';
import { Schema } from '@forgehive/schema';

const myTask = createTask({
  name: 'taskName',           // Required: Clear, descriptive name
  description: 'What it does', // Required: Brief description
  schema: inputSchema,        // Required: Schema for input validation
  boundaries,                 // Required: External dependency interfaces
  fn: async (input, boundaries) => {
    // Task implementation
    return result;
  }
});
```

## 1. Creating a Task

### Basic Task Creation

**Always use the CLI to create tasks initially:**

```bash
# Create a new task using the CLI command
forge task:create user:createUser
```

This command:
1. Creates a new TypeScript file in the tasks directory (e.g., `tasks/user/createUser.ts`)
2. Generates boilerplate code with proper imports and structure
3. Updates the `forge.json` configuration file to register the task
4. Uses Handlebars templating to ensure consistent formatting

The generated file will look like this:

```typescript
// TASK: createUser
// Run this task with:
// forge task:run user:createUser

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'

const name = 'user:createUser'
const description = 'Add task description here'

const schema = new Schema({
  // Add your schema definitions here
  // example: myParam: Schema.string()
})

const boundaries = {
  // Add your boundary functions here
  // example: readFile: async (path: string) => { /* File reading logic */ }
}

export const createUser = createTask({
  name,
  description,
  schema,
  boundaries,
  fn: async function (argv, boundaries) {
    console.log('input:', argv)
    console.log('boundaries:', boundaries)
    // Your task implementation goes here
    const status = { status: 'Ok' }

    return status
  }
})
```

**Then modify the generated file to implement your specific logic:**

```typescript
// TASK: createUser
// Run this task with:
// forge task:run user:createUser

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'

const name = 'user:createUser'
const description = 'Create a new user account with email notification'

const schema = new Schema({
  name: Schema.string(),
  email: Schema.string().email(),
  age: Schema.number().optional()
})

const boundaries = {
  saveUser: async (userData) => { /* DB save logic */ },
  findUser: async (email) => { /* DB find logic */ },
  sendWelcomeEmail: async (to, subject) => { /* Email sending logic */ }
}

export const createUser = createTask({
  name,
  description,
  schema,
  boundaries,
  fn: async function ({ name, email, age }, { saveUser, findUser, sendWelcomeEmail }) {
    console.log(`Creating user: ${email}`);

    // Check if user exists - Forge&Hive automatically handles thrown errors
    const existing = await findUser(email);
    if (existing) {
      throw new Error('User already exists');
    }

    // Create user
    const userId = await saveUser({ name, email, age });

    // Send welcome email
    await sendWelcomeEmail(email, `Welcome ${name}!`);

    // Simply return data on success - no try-catch needed
    return {
      message: `User "${name}" created successfully`,
      data: { userId, email }
    };
  }
})
```

### Key Principles for Task Creation

1. **Name and Description**: Always provide clear, descriptive names and descriptions
2. **Schema Definition**: Use Zod-based schemas to validate all inputs
3. **Boundary Isolation**: All external operations (network, file system, database, etc.) go in boundaries
4. **Pure Logic**: Task logic should be deterministic and testable
5. **No try-catch needed**: Forge&Hive automatically handles errors - just throw on error, return on success
6. **Destructuring**: Use destructuring for cleaner code: `({ name, email }, { saveUser, sendEmail })`

### What Goes in Boundaries

- Database operations
- Network requests (HTTP, API calls)
- File system operations
- Email sending
- External service calls
- Logging operations
- Any non-deterministic operations

**Important**: All boundary function arguments and return values are logged to the execution record for debugging and replay purposes. Consider this when handling sensitive data:

- **Avoid logging sensitive data**: Don't pass passwords, API keys, or personal information directly through boundaries
- **Use references instead**: Pass user IDs instead of full user objects with sensitive fields
- **Sanitize data**: Filter out sensitive fields before passing to boundaries
- **Ask users**: When designing boundaries, confirm with users which data should be included in execution logs

## 2. Running a Task

### CLI Command Pattern

Tasks are primarily run via CLI commands. There are two ways to pass arguments:

#### Option 1: Using --input (JSON format)
```bash
# Use --input with JSON string for complex data
forge task:run user:createUser --input='{"name":"John","email":"john@example.com","age":30}'
```

#### Option 2: Using minimist arguments (direct flags)
```bash
# Use direct command line flags (automatically spread by minimist)
# With equals sign and quotes
forge task:run user:createUser --name="John" --email="john@example.com" --age=30

# Without equals sign (space-separated)
forge task:run user:createUser --name "John" --email "john@example.com" --age 30

# Mixed styles (both work identically)
forge task:run user:createUser --name="John" --email "john@example.com" --age 30
```

**When to use each:**
- **--input**: Best for complex objects, arrays, or when copying JSON data
- **Direct flags**: Best for simple parameters and interactive CLI usage

#### Examples of Both Approaches

**Simple task with basic parameters:**
```bash
# Using direct flags (recommended for simple cases)
forge task:run user:createUser --name="John Doe" --email="john@example.com" --age=30
# Or without equals signs
forge task:run user:createUser --name "John Doe" --email "john@example.com" --age 30

# Using --input (alternative)
forge task:run user:createUser --input='{"name":"John Doe","email":"john@example.com","age":30}'
```

### Integrating Tasks into Applications

When integrating tasks into applications programmatically, you have two execution methods:

#### Basic Execution

```typescript
// Basic execution throws on error - requires try/catch
try {
  const result = await createUser.run({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  });
  console.log('Task succeeded:', result);
} catch (error) {
  console.error('Task failed:', error.message);
}
```

#### Safe Execution (Recommended)

```typescript
// Safe execution returns [result, error, executionRecord] - no try/catch needed
const [result, error, executionRecord] = await createUser.safeRun({
  name: 'John Doe',
  email: 'john@example.com'
});

if (error) {
  console.error('Task failed:', error.message);
} else {
  console.log('Task succeeded:', result);
}

// Access execution record for debugging/analysis
if (executionRecord) {
  console.log('Boundary calls:', executionRecord);
}
```


## 3. Publishing a Task

Tasks can be published using the CLI command:

```bash
forge task:publish user:createUser
```

**Note**: Currently, the publish system overwrites existing versions. Version control and registry management are not yet implemented.

## 4. Removing a Task

Tasks can be removed using the CLI command:

```bash
forge task:remove user:createUser
```

**Note**: This removes the task from the local `forge.json` configuration file only. Remote registry removal is not yet implemented.

## Frontend Integration with taskToAction Pattern

When integrating Forge&Hive tasks into frontend applications (React Router, Next.js, etc.), a common pattern is to create action functions that wrap Forge&Hive tasks with proper error handling and type safety.

### The taskToAction Helper Pattern

Create a reusable helper that converts Forge&Hive tasks into standardized action results:

```typescript
// lib/taskToAction.ts
export interface ActionResult<TData = any> {
  success: boolean
  message: string
  data?: TData
  error?: string
}

// Helper function that returns a function for executing tasks
export function taskToAction<TData = any, TTask extends { safeRun: (input: any) => Promise<[any, any, any]>; name?: string } = any>(
  task: TTask
): (input: any) => Promise<ActionResult<TData>> {
  // Extract the task name from the task object
  const taskName = task.name || 'unknown task';

  return async (input: any): Promise<ActionResult<TData>> => {
    try {
      console.log(`🚀 [ACTION] ${taskName} - Starting via Forge&Hive task`);
      console.log(`📊 [ACTION] ${taskName} - Parameters:`, input);

      // Use safeRun for better error handling
      const [result, error, executionRecord] = await task.safeRun(input);

      if (error) {
        console.log(`❌ [ACTION] ${taskName} - TASK FAILED:`, error.message);
        return {
          success: false,
          message: error.message || `Failed to execute ${taskName}`,
          error: error.message
        };
      }

      if (!result) {
        throw new Error('Task completed but returned null result');
      }

      console.log(`✅ [ACTION] ${taskName} - SUCCESS:`, result.message);
      console.log(`📋 [ACTION] ${taskName} - Result data:`, result.data);

      return {
        success: true,
        message: result.message || `${taskName} completed successfully`,
        data: result.data
      };
    } catch (error) {
      console.log(`❌ [ACTION] ${taskName} - CATCH ERROR:`, error);
      return {
        success: false,
        message: `Failed to execute ${taskName}`,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
}
```

### Using taskToAction in Frontend Actions

```typescript
// actions/portfolio.ts
import { taskToAction, type ActionResult } from '../lib/taskToAction'
import { createPortfolioTask, removePortfolioTask, type Portfolio } from '@your-package/portfolios'

export interface CreatePortfolioData {
  name: string
  description?: string
  initialCash: number
}

// Clean, readable action functions using the taskToAction pattern
export async function createPortfolio(data: CreatePortfolioData): Promise<ActionResult<Portfolio>> {
  const action = taskToAction<Portfolio>(createPortfolioTask);

  return await action({
    name: data.name,
    initialCash: data.initialCash,
    description: data.description
  });
}

export async function removePortfolio(slug: string): Promise<ActionResult<Portfolio>> {
  const action = taskToAction<Portfolio>(removePortfolioTask);

  return await action({ slug });
}
```

### Benefits of This Pattern

1. **Consistent Error Handling**: All tasks use the same error handling pattern
2. **Type Safety**: Generic types ensure proper typing for action results
3. **Automatic Logging**: Built-in logging for debugging and monitoring
4. **Clean Separation**: Task configuration is separate from execution
5. **Reusable**: The `taskToAction` helper works with any Forge&Hive task
6. **Functional Style**: Follows currying pattern for better composition

### Task Error Handling Guidelines

**Important**: Tasks should throw errors instead of returning error status objects:

```typescript
// ✅ Good: Throw errors for exceptional cases, return data directly for success
const myTask = createTask({
  name: 'portfolio:create',
  description: 'Create a new portfolio',
  schema,
  boundaries,
  fn: async ({ name }, { portfolioExists, savePortfolio }) => {
    const exists = await portfolioExists(name);
    if (exists) {
      throw new Error(`Portfolio with name "${name}" already exists`); // Throw error
    }

    const portfolio = await savePortfolio({ name });
    return {
      message: `Portfolio "${name}" created successfully`,
      data: portfolio
    };
  }
});
```

```typescript
// ❌ Avoid: Don't return error status objects
const myTask = createTask({
  fn: async ({ name }, { portfolioExists, savePortfolio }) => {
    const exists = await portfolioExists(name);
    if (exists) {
      return { // Don't return error objects
        status: 'error',
        message: `Portfolio with name "${name}" already exists`
      };
    }
    // ...
  }
});
```

### Key Principles:

1. **Throw for errors**: Use `throw new Error()` for exceptional cases
2. **Return for success**: Simply return the result object - no need for `status: 'success'`
3. **Consistent format**: Return objects with `message` and `data` properties
4. **Let taskToAction handle the rest**: The helper converts task results to ActionResult format

This pattern allows the `taskToAction` helper to handle errors consistently using `safeRun`, and frontend code gets predictable `ActionResult` objects with proper type safety.

## Task Best Practices

### 1. Schema Design

```typescript
// Available schema types and validations
const schema = new Schema({
  // Basic types
  name: Schema.string(),
  age: Schema.number(),
  isActive: Schema.boolean(),
  createdAt: Schema.date(),

  // String validations
  email: Schema.string().email(),
  password: Schema.string().min(8).max(50),
  username: Schema.string().regex(/^[a-zA-Z0-9_]+$/),

  // Number validations
  score: Schema.number().min(0).max(100),

  // Arrays
  tags: Schema.array(Schema.string()),
  scores: Schema.array(Schema.number()),

  // Records (key-value objects)
  stringData: Schema.stringRecord(),        // Record<string, string>
  numberData: Schema.numberRecord(),        // Record<string, number>
  booleanData: Schema.booleanRecord(),      // Record<string, boolean>
  mixedData: Schema.mixedRecord(),          // Record<string, string | number | boolean>

  // Optional fields
  description: Schema.string().optional(),
  metadata: Schema.mixedRecord().optional()
});
```

### 2. Boundary Organization

```typescript
// Boundaries are a flat record of string keys to functions
const boundaries = {
  saveUser: async (userData) => { /* ... */ },
  findUser: async (id) => { /* ... */ },
  chargePayment: async (amount, token) => { /* ... */ },
  sendEmail: async (to, subject, body) => { /* ... */ },
  sendSms: async (to, message) => { /* ... */ }
};
```

**Note**: Boundaries currently support a flat `Record<string, function>` structure. Nested organization is not yet supported.

### 3. Error Handling

**IMPORTANT**: Forge&Hive tasks handle errors automatically. Do NOT use try-catch blocks unless you need custom cleanup logic.

#### ✅ Default Pattern (Recommended - No try-catch needed)

```typescript
const myTask = createTask({
  name: 'processPayment',
  description: 'Process user payment',
  schema: new Schema({
    amount: Schema.number().min(0),
    token: Schema.string()
  }),
  boundaries: {
    chargePayment: async (amount, token) => { /* Payment logic */ },
  },
  fn: async ({ amount, token }, { chargePayment }) => {
    console.log(`Processing payment: $${amount}`);

    // Forge&Hive automatically catches and handles any errors thrown here
    const result = await chargePayment(amount, token);

    if (!result.success) {
      throw new Error(`Payment failed: ${result.error}`); // This is automatically handled
    }

    // Simply return data on success
    return {
      message: `Payment of $${amount} processed successfully`,
      data: { transactionId: result.id }
    };
  }
});
```

#### ⚠️ Only Use try-catch for Custom Cleanup Logic

```typescript
const myTaskWithCleanup = createTask({
  name: 'processPaymentWithCleanup',
  description: 'Process payment with cleanup on failure',
  schema: new Schema({
    amount: Schema.number().min(0),
    token: Schema.string()
  }),
  boundaries: {
    chargePayment: async (amount, token) => { /* Payment logic */ },
    updateOrderStatus: async (status) => { /* Update status */ }
  },
  fn: async ({ amount, token }, { chargePayment, updateOrderStatus }) => {
    try {
      console.log(`Processing payment: $${amount}`);
      const result = await chargePayment(amount, token);

      if (!result.success) {
        throw new Error(`Payment failed: ${result.error}`);
      }

      return {
        message: `Payment of $${amount} processed successfully`,
        data: { transactionId: result.id }
      };
    } catch (error) {
      // ONLY use try-catch when you need custom cleanup logic
      await updateOrderStatus('failed'); // Custom cleanup action
      console.error('Payment processing failed, status updated to failed', error);
      throw error; // MUST re-throw to preserve error context
    }
  }
});
```

**Key Rules:**
- **Default**: No try-catch needed - Forge&Hive handles all errors automatically
- **Exception**: Only use try-catch when you need custom cleanup actions (database updates, logging, etc.)
- **Always re-throw**: If you catch an error, you MUST re-throw it to preserve the error context
- **Never swallow errors**: Don't return success from a catch block

### 4. Testing Tasks

```typescript
import { createMockBoundary } from './testUtils';

describe('createUser task', () => {
  afterEach(() => {
    createUser.resetMocks();
  });

  it('should create user successfully', async () => {
    // Mock boundaries
    const saveUserMock = createMockBoundary(
      jest.fn().mockResolvedValue('user-123')
    );
    const sendEmailMock = createMockBoundary(
      jest.fn().mockResolvedValue(true)
    );

    createUser.mockBoundary('saveUser', saveUserMock);
    createUser.mockBoundary('sendWelcomeEmail', sendEmailMock);

    // Run task
    const result = await createUser.run({
      name: 'Test User',
      email: 'test@example.com'
    });

    // Verify results
    expect(result.success).toBe(true);
    expect(saveUserMock).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com'
    });
  });
});
```

## Quick Reference

### Essential Imports
```typescript
import { createTask } from '@forgehive/task';
import { Schema } from '@forgehive/schema';
```

### Task Template
```typescript
const myTask = createTask({
  name: 'descriptiveName',
  description: 'What this task does',
  schema: new Schema({ /* input validation */ }),
  boundaries: { /* external dependencies */ },
  fn: async (input, boundaries) => {
    // Task logic here
    return result;
  }
});
```

### Execution
```typescript
// Throws on error
const result = await myTask.run(input);

// Safe execution (recommended)
const [result, error, executionRecord] = await myTask.safeRun(input);
```

### Testing
```typescript
// Mock a boundary
myTask.mockBoundary('boundaryName', createMockBoundary(jest.fn()));

// Reset mocks
myTask.resetMocks();
```

This guide provides the essential patterns for working with Forge&Hive tasks. Remember: keep tasks focused, isolate external operations in boundaries, and always validate inputs with schemas.