import {
  createContextDocumentMessages,
  getModelConfig,
  getModelFromConfig,
  isUsingO1MiniModel,
} from "../../utils.js";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { AIMessageChunk } from "@langchain/core/messages";
import { RunnableBinding } from "@langchain/core/runnables";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { ConfigurableChatModelCallOptions } from "langchain/chat_models/universal";
import {
  getArtifactContent,
  isArtifactMarkdownContent,
} from "@opencanvas/shared/utils/artifacts";
import { ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import {
  OpenCanvasGraphAnnotation,
  OpenCanvasGraphReturnType,
} from "../state.js";

const PROMPT = `You are an expert AI writing assistant, tasked with rewriting some text a user has selected. The selected text is nested inside a larger 'block'. You should always respond with ONLY the updated text block in accordance with the user's request.
You should always respond with the full markdown text block, as it will simply replace the existing block in the artifact.
The blocks will be joined later on, so you do not need to worry about the formatting of the blocks, only make sure you keep the formatting and structure of the block you are updating.

# Selected text
{highlightedText}

# Text block
{textBlocks}

Your task is to rewrite the sourounding content to fulfill the users request. The selected text content you are provided above has had the markdown styling removed, so you can focus on the text itself.
However, ensure you ALWAYS respond with the full markdown text block, including any markdown syntax.
NEVER wrap your response in any additional markdown syntax, as this will be handled by the system. Do NOT include a triple backtick wrapping the text block, unless it was present in the original text block.
You should NOT change anything EXCEPT the selected text. The ONLY instance where you may update the sourounding text is if it is necessary to make the selected text make sense.
You should ALWAYS respond with the full, updated text block, including any formatting, e.g newlines, indents, markdown syntax, etc. NEVER add extra syntax or formatting unless the user has specifically requested it.
If you observe partial markdown, this is OKAY because you are only updating a partial piece of the text.

Ensure you reply with the FULL text block, including the updated selected text. NEVER include only the updated selected text, or additional prefixes or suffixes.`;

/**
 * Update an existing artifact based on the user's query.
 */
export const updateHighlightedText = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<OpenCanvasGraphReturnType> => {
  const { modelProvider, modelName } = getModelConfig(config);
  let model: RunnableBinding<
    BaseLanguageModelInput,
    AIMessageChunk,
    ConfigurableChatModelCallOptions
  >;
  if (modelProvider.includes("openai") || modelName.includes("3-5-sonnet")) {
    // Custom model is intelligent enough for updating artifacts
    model = (
      await getModelFromConfig(config, {
        temperature: 0,
      })
    ).withConfig({ runName: "update_highlighted_markdown" });
  } else {
    // Custom model is not intelligent enough for updating artifacts
    model = (
      await getModelFromConfig(
        {
          ...config,
          configurable: {
            customModelName: "gpt-4o",
          },
        },
        {
          temperature: 0,
        }
      )
    ).withConfig({ runName: "update_highlighted_markdown" });
  }

  const currentArtifactContent = state.artifact
    ? getArtifactContent(state.artifact)
    : undefined;
  if (!currentArtifactContent) {
    throw new Error("No artifact found");
  }
  if (!isArtifactMarkdownContent(currentArtifactContent)) {
    throw new Error("Artifact is not markdown content");
  }

  if (!state.highlightedText) {
    throw new Error(
      "Can not partially regenerate an artifact without a highlight"
    );
  }

  const { markdownBlock, selectedText, fullMarkdown } = state.highlightedText;
  const formattedPrompt = PROMPT.replace(
    "{highlightedText}",
    selectedText
  ).replace("{textBlocks}", markdownBlock);

  const recentUserMessage = state._messages[state._messages.length - 1];
  if (recentUserMessage.getType() !== "human") {
    throw new Error("Expected a human message");
  }

  const contextDocumentMessages = await createContextDocumentMessages(config);
  const isO1MiniModel = isUsingO1MiniModel(config);
  const response = await model.invoke([
    {
      role: isO1MiniModel ? "user" : "system",
      content: formattedPrompt,
    },
    ...contextDocumentMessages,
    recentUserMessage,
  ]);
  const responseContent = response.content as string;

  const newCurrIndex = state.artifact.contents.length + 1;
  const prevContent = state.artifact.contents.find(
    (c) => c.index === state.artifact.currentIndex && c.type === "text"
  ) as ArtifactMarkdownV3 | undefined;
  if (!prevContent) {
    throw new Error("Previous content not found");
  }

  console.log("Full markdown:", JSON.stringify(fullMarkdown));
  console.log("Markdown block:", JSON.stringify(markdownBlock));

  // Add normalization function
  const normalizeString = (str: string) => 
    str.replace(/\r\n/g, '\n')
       .replace(/\r/g, '\n')
       // Remove any leading spaces at the start of each line
       .split('\n')
       .map(line => line.trimStart())
       .join('\n')
       .trim();

  const normalizedFullMarkdown = normalizeString(fullMarkdown);
  const normalizedMarkdownBlock = normalizeString(markdownBlock);

  // Add debug logging to see exact content
  console.log("Normalized full markdown:", JSON.stringify(normalizedFullMarkdown));
  console.log("Normalized markdown block:", JSON.stringify(normalizedMarkdownBlock));

  if (!normalizedFullMarkdown.includes(normalizedMarkdownBlock)) {
    // Try to find the content with fuzzy matching
    const lines = normalizedMarkdownBlock.split('\n');
    const firstLine = lines[0];
    if (!normalizedFullMarkdown.includes(firstLine)) {
      console.log("Even first line not found:", firstLine);
      throw new Error("Selected text not found in current content");
    }
    
    // Find the position of the first line and extract the surrounding context
    const startIndex = normalizedFullMarkdown.indexOf(firstLine);
    const contextAround = normalizedFullMarkdown.slice(
      Math.max(0, startIndex - 100),
      Math.min(normalizedFullMarkdown.length, startIndex + firstLine.length + 100)
    );
    console.log("Context around first line:", JSON.stringify(contextAround));
    throw new Error("Selected text not found in current content");
  }

  // Use normalized strings for replacement to maintain consistency
  const newFullMarkdown = normalizedFullMarkdown.replace(normalizedMarkdownBlock, normalizeString(responseContent));

  const updatedArtifactContent: ArtifactMarkdownV3 = {
    ...prevContent,
    index: newCurrIndex,
    fullMarkdown: newFullMarkdown,
  };

  return {
    artifact: {
      ...state.artifact,
      currentIndex: newCurrIndex,
      contents: [...state.artifact.contents, updatedArtifactContent],
    },
  };
};
