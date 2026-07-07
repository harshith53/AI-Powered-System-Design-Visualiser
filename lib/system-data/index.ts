import type { ArchitectureBlueprint } from "@/types/architecture";
import { rateLimiterBlueprint } from "./rate-limiter";

export const blueprints: Record<string, ArchitectureBlueprint> = {
  [rateLimiterBlueprint.id]: rateLimiterBlueprint,
};

export const defaultBlueprint = rateLimiterBlueprint;

export { rateLimiterBlueprint };
