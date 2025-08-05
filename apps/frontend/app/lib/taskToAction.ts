import { HiveLogClient } from '@forgehive/hive-sdk'

export interface ActionResult<TData = any> {
  success: boolean
  message: string
  data?: TData
  error?: string
}

const hiveClient = new HiveLogClient({
  projectName: process.env.VITE_HIVE_PROJECT_NAME || 'Fritz Application',
  apiKey: process.env.VITE_HIVE_API_KEY,
  apiSecret: process.env.VITE_HIVE_API_SECRET,
  host: process.env.VITE_HIVE_HOST,
  metadata: {
    environment: process.env.VITE_NODE_ENV || 'development',
    projectUuid: process.env.VITE_PROJECT_UUID || 'ee0ff3ad-551d-4734-ac10-86ad6b6ddf64'
  }
})

// Helper function to convert Forge&Hive task results to ActionResult
// Returns a function that takes input and executes the task
export function taskToAction<TData = any, TTask extends { safeRun: (input: any) => Promise<[any, any, any]>; getName: () => string } = any>(
  task: TTask
): (input: any) => Promise<ActionResult<TData>> {
  // Get the task name using the getName method
  const taskName = task.getName();

  return async (input: any): Promise<ActionResult<TData>> => {
    try {
      console.log(`🚀 [ACTION] ${taskName} - Starting via Forge&Hive task`);
      console.log(`📊 [ACTION] ${taskName} - Parameters:`, input);

      // Use safeRun for better error handling (returns [result, error, executionRecord])
      const [result, error, executionRecord] = await task.safeRun(input);

      // Send log to Hive with the execution record
      try {
        console.log(`📊 [HIVE] Execution record:`, executionRecord);
        const logStatus = await hiveClient.sendLog(executionRecord);
        console.log(`📊 [HIVE] Log sent with status: ${logStatus}`);
      } catch (hiveError) {
        console.warn(`⚠️ [HIVE] Failed to send log:`, hiveError);
        // Don't fail the main operation if logging fails
      }


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

      // Task returns data directly - convert to ActionResult format
      const message = `${taskName} completed successfully`;
      const data = result; // Task result becomes the data

      console.log(`✅ [ACTION] ${taskName} - SUCCESS:`, message);
      console.log(`📋 [ACTION] ${taskName} - Result data:`, data);

      return {
        success: true,
        message,
        data
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