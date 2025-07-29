import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("rooms/:uuid", "routes/rooms.$uuid.tsx"),
] satisfies RouteConfig;
