import {
  createContextDocumentMessages,
  getFormattedReflections,
  getModelConfig,
  getModelFromConfig,
  optionallyGetSystemPromptFromConfig,
} from "../../../utils.js";
import { ArtifactV3 } from "@opencanvas/shared/types";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import {
  OpenCanvasGraphAnnotation,
  OpenCanvasGraphReturnType,
} from "../../state.js";
import { TermPlanSetSchema } from "./schemas.js";
import { formatNewArtifactPrompt } from "./utils.js";

/**
 * Generate a new structured artifact based on the user's query.
 */
export const generateArtifactStructured = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<OpenCanvasGraphReturnType> => {
  const { modelName } = getModelConfig(config, {
    isToolCalling: true,
  });
  
  // Create model with structured output
  const model = await getModelFromConfig(config, {
    temperature: 0,
    isToolCalling: true,
  });
  const structuredModel = model.withStructuredOutput(TermPlanSetSchema);

  // Get existing messages and prompts from state
  const contextDocumentMessages = await createContextDocumentMessages(config);
  const userSystemPrompt = optionallyGetSystemPromptFromConfig(config);
  const memoriesAsString = await getFormattedReflections(config);
  
  // Use existing prompt handling
  const formattedNewArtifactPrompt = formatNewArtifactPrompt(
    memoriesAsString,
    modelName
  );

  const fullSystemPrompt = userSystemPrompt
    ? `${userSystemPrompt}\n${formattedNewArtifactPrompt}`
    : formattedNewArtifactPrompt;

  // Generate structured output
  const structuredResponse = await structuredModel.invoke(
    [
      { role: "system", content: fullSystemPrompt },
      ...contextDocumentMessages,
      ...state._messages,
    ]
  );

  // Create artifact with JSON structure
  const newArtifactContent = {
    index: 1,
    type: "text" as const,
    title: `Term Plan: ${structuredResponse.terms[0]?.term_name || 'New Plan'}`,
    fullMarkdown: JSON.stringify(structuredResponse, null, 2), // Keep as formatted JSON
  };

  const newArtifact: ArtifactV3 = {
    currentIndex: 1,
    contents: [newArtifactContent],
  };

  return {
    artifact: newArtifact,
  };
}; 