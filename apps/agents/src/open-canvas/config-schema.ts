import { CustomModelConfig } from "@opencanvas/shared/types";

/**
 * Schema for the Open Canvas agent configuration.
 * This defines the expected configuration structure.
 */
export type OpenCanvasAgentConfig = {
  // Model configuration
  customModelName: string;
  modelConfig: CustomModelConfig;
  
  // Assistant and user information
  assistant_id: string;
  supabase_user_id: string;
  supabase_session?: any;
  thread_id?: string;
  
  // Feature flags
  webSearchEnabled: boolean;
  useDefaultConfigOnly: boolean;
  
  // Content configuration
  systemPrompt: string;
}; 