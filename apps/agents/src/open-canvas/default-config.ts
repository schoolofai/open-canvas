import { DEFAULT_MODEL_CONFIG, DEFAULT_MODEL_NAME } from "@opencanvas/shared/models";
import { OpenCanvasAgentConfig } from "./config-schema";

/**
 * Default configuration for the Open Canvas agent.
 * This provides fallback values when the frontend doesn't provide them.
 */
export const DEFAULT_AGENT_CONFIG: OpenCanvasAgentConfig = {
  // Model configuration
  customModelName: DEFAULT_MODEL_NAME,
  modelConfig: DEFAULT_MODEL_CONFIG,
  
  // Default assistant and user IDs
  assistant_id: "default_assistant",
  supabase_user_id: "anonymous_user",
  
  // Feature flags
  webSearchEnabled: false,
  useDefaultConfigOnly: false,
  
  // Content configuration
  systemPrompt: "You are a helpful AI assistant that helps users write and edit documents.",
};

/**
 * Merges provided configuration with default configuration.
 * This ensures all required fields exist even if not provided by the frontend.
 * @param configurable - Configuration provided by the frontend
 * @returns Merged configuration with defaults
 */
export function mergeWithDefaultConfig(configurable?: Record<string, any>): OpenCanvasAgentConfig {
  const defaults = { ...DEFAULT_AGENT_CONFIG };
  
  // If useDefaultConfigOnly is true or no config provided, use defaults
  if (defaults.useDefaultConfigOnly || !configurable) {
    return defaults;
  }
  
  // Otherwise merge with frontend config
  return {
    ...defaults,
    ...configurable,
  };
} 