/**
 * Shared executable quality policy. Product tests remain app-owned.
 * No line-count limit: ordinary routes are syntax-checked re-export adapters.
 */
export const architecturePolicy = Object.freeze({
  environmentFile: "src/config/env.ts",
  compilerEnvironmentConstants: ["EXPO_SERVER"],
  foundationalLayers: ["foundation", "config"],
  sharedLayers: ["components", "theme", "services"],
});

export const checkStages = Object.freeze([
  { name: "typecheck", script: "typecheck" },
  { name: "lint", script: "lint" },
  { name: "format", script: "format:check" },
  { name: "structure", file: "verify-blueprint.mjs" },
  { name: "architecture", file: "verify-architecture.mjs" },
  { name: "accessibility", file: "verify-accessibility.mjs" },
  { name: "assets", script: "assets:check", optional: true },
  { name: "behavior and resilience", script: "test" },
]);
export const shellStages = Object.freeze([
  { name: "web export", script: "build:web" },
  { name: "shared shell journeys", script: "test:e2e:shell" },
]);
