import { type RouteConfig, index } from "@react-router/dev/routes";
import { config } from 'dotenv';
import path from 'path';

// Load environment variables at application startup
// Load root .env first as base configuration
config({ path: path.resolve(process.cwd(), '../../.env') });
// Then load app-level .env with override (highest priority)
config({ path: path.resolve(process.cwd(), '.env'), override: true });

export default [
  index("routes/home.tsx"),
] satisfies RouteConfig;
