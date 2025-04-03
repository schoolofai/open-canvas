# Open Canvas Clone - Integration Strategy for Existing Vite App

## Introduction

This document outlines a strategy for integrating the Open Canvas functionality into an existing Vite-based React application. Instead of creating a new application or reimplementing components from scratch, we'll focus on a "lift and shift" approach to port the existing components with minimal modifications.

## Product Requirements Document (PRD)

### Overview

Open Canvas is an AI-assisted canvas application that enables:
- Real-time streaming chat with AI
- Rich editing of AI-generated content
- Text selection and highlighting for contextual editing
- Markdown and code rendering and editing
- Multiple artifact management
- Thread-based conversations

### Key Features

1. **Interactive Canvas**: A rich editing environment for AI-generated content with both view and edit modes
2. **Text Selection and Highlighting**: Select text passages to ask AI to modify specific content
3. **Streaming AI Responses**: Real-time streaming of AI responses with token-by-token updates
4. **Multiple Content Types**: Support for both markdown text and code artifacts with appropriate editors
5. **Artifact Management**: Switch between different artifacts and edit their content
6. **Thread Management**: Organize conversations in threads
7. **Web Search Integration**: Integrated web search for enhanced AI responses
8. **Split Panel UI**: Resizable interface with chat and canvas panels

### User Flows

1. **Start New Conversation**: User starts a conversation with the AI
2. **Receive and Edit Response**: AI responds with content that can be viewed or edited in the canvas
3. **Select Text for Contextual Editing**: User can highlight text and ask AI to modify specific sections
4. **Switch Between Artifacts**: Navigate between different pieces of content generated during the conversation
5. **Edit Content Directly**: Make manual edits to the content using rich editors
6. **Toggle Between Raw/Rendered Views**: Switch between raw markdown and rendered views

## Technical Architecture

### Core Components

#### Context Providers
- **GraphContext**: Central state management for artifacts, messages, and streaming
- **ThreadProvider**: Manages threads and conversation history
- **AssistantContext**: Manages the assistant model and configuration
- **UserContext**: Handles user authentication and preferences

#### UI Components
- **Canvas**: Main container that hosts both chat and artifact rendering
- **ArtifactRenderer**: Renders different types of artifacts (markdown, code)
- **TextRenderer**: Rich markdown editor with selection capabilities
- **CodeRenderer**: Code editor with syntax highlighting
- **ContentComposer**: Chat interface for user input and history
- **WebSearchResults**: Displays web search results during conversations
- **ActionsToolbar**: Provides editing and action controls for artifacts
- **ReflectionsDialog**: Displays AI reflections on content
- **ArtifactHeader**: Headers for the artifact display area

#### Utility Components
- **NoSSRWrapper**: Handles server/client rendering differences
- **Icons**: Custom icon components

## Integration Strategy

### 1. Add Dependencies to Existing Vite App

Add the necessary dependencies to your existing Vite app:

```bash
# Core UI and functionality dependencies
npm install @blocknote/react @blocknote/core @blocknote/shadcn @codemirror/view @codemirror/state
npm install @langchain/core langchain uuid framer-motion

# UI libraries (if not already present)
npm install lucide-react class-variance-authority clsx

# If using Tailwind (add if not already present)
npm install -D tailwindcss postcss autoprefixer
```

### 2. Create Directory Structure

Add the following directories to your existing project structure:

```
src/
├── components/
│   ├── artifacts/             # Artifact rendering components
│   ├── canvas/                # Canvas container components
│   ├── web-search-results/    # Web search results display
│   ├── reflections-dialog/    # AI reflections UI
│   └── ui/                    # Reusable UI components
├── contexts/                  # Context providers
├── hooks/                     # Custom hooks
├── lib/                       # Utility functions
├── types/                     # TypeScript type definitions
└── utils/                     # Helper functions
```

### 3. Port Context Providers

First, port all the context providers as they form the foundation of the application:

#### GraphContext.tsx

```typescript
// src/contexts/GraphContext.tsx
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
// Replace Next.js imports with React/Vite equivalents
// import { useToast } from "@/hooks/use-toast";
import { useToast } from "../hooks/use-toast";

// Copy the rest of the file from apps/web/src/contexts/GraphContext.tsx
// ...

export function useGraphContext() {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraphContext must be used within a GraphProvider');
  }
  return context;
}
```

#### ThreadProvider.tsx

```typescript
// src/contexts/ThreadProvider.tsx
import React, { createContext, useContext, useState } from 'react';
// Replace Next.js imports
// import { useSearchParams } from "next/navigation";
import { useSearchParams } from "react-router-dom";

// Copy the rest from apps/web/src/contexts/ThreadProvider.tsx
// ...
```

#### AssistantContext.tsx

```typescript
// src/contexts/AssistantContext.tsx
import React, { createContext, useContext, useState } from 'react';
// Replace Next.js specific imports
// ...

// Copy the rest from apps/web/src/contexts/AssistantContext.tsx
// ...
```

#### UserContext.tsx

```typescript
// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState } from 'react';
// Replace Next.js specific imports
// ...

// Copy the rest from apps/web/src/contexts/UserContext.tsx
// ...
```

### 4. Port UI Components

Port the UI components in the following order:

#### Basic UI Components

1. Port common UI components from `apps/web/src/components/ui/` to your project
2. For Next.js specific components like `<Link>`, replace with React Router equivalents

#### Canvas Components

```typescript
// src/components/canvas/canvas.tsx
// Replace Next.js imports
// import { useRouter, useSearchParams } from "next/navigation";
import { useNavigate, useSearchParams } from "react-router-dom";

// Import your ported contexts
import { useGraphContext } from "../../contexts/GraphContext";
import { useThreadContext } from "../../contexts/ThreadProvider";

// For Next.js specific components
// Replace ResizablePanelGroup with a React alternative or port it
// Options include:
// - react-resizable
// - re-resizable
// - react-split-pane

// Copy the rest from apps/web/src/components/canvas/canvas.tsx
// ...
```

```typescript
// src/components/canvas/content-composer.tsx
// Similar process for content-composer
// ...
```

#### Artifact Components

```typescript
// src/components/artifacts/ArtifactRenderer.tsx
// Import from your ported contexts
import { useGraphContext } from "../../contexts/GraphContext";
import { useUserContext } from "../../contexts/UserContext";
import { useAssistantContext } from "../../contexts/AssistantContext";

// Copy the rest from apps/web/src/components/artifacts/ArtifactRenderer.tsx
// ...
```

```typescript
// src/components/artifacts/TextRenderer.tsx
// Similar process
// ...
```

```typescript
// src/components/artifacts/CodeRenderer.tsx
// Similar process
// ...
```

#### Action Components

```typescript
// src/components/artifacts/actions_toolbar/index.tsx
// Port the actions toolbar components
// ...
```

#### Web Search Components

```typescript
// src/components/web-search-results/index.tsx
// Port the web search results components
// ...
```

### 5. Port Utility Functions and Hooks

Port utility functions and hooks that are required by the components:

```typescript
// src/hooks/use-toast.ts
// Create or port the toast hook
// ...
```

```typescript
// src/lib/utils.ts
// Port utility functions
// ...
```

```typescript
// src/lib/convert_messages.ts
// Port message conversion utilities
// ...
```

### 6. Adapting Next.js Specific Features

#### Replace Import Paths

Replace Next.js aliased imports with relative imports:

```typescript
// From:
import { Button } from "@/components/ui/button";

// To:
import { Button } from "../../components/ui/button";
```

#### Replace Next.js Components

| Next.js Component | Vite/React Replacement |
|-------------------|------------------------|
| `next/image` | Regular `<img>` tags |
| `next/link` | `<Link>` from react-router-dom |
| `next/font` | Web fonts (Google Fonts, etc.) |
| `useRouter` | `useNavigate` from react-router-dom |
| `useSearchParams` | `useSearchParams` from react-router-dom |

#### Replace Server Components

Convert any Server Components to Client Components:

```typescript
// From:
// This is a server component in Next.js

// To:
"use client";
// Now it's a client component
```

#### Handle Search Params

Replace Next.js search params handling:

```typescript
// From:
const searchParams = useSearchParams();
const param = searchParams.get('key');

// To:
const [searchParams] = useSearchParams();
const param = searchParams.get('key');
```

### 7. Integrate with Your App

Add the Canvas component to your existing Vite application:

```tsx
// src/App.tsx or your route component
import { BrowserRouter as Router } from 'react-router-dom';
import { GraphProvider } from './contexts/GraphContext';
import { ThreadProvider } from './contexts/ThreadProvider';
import { AssistantProvider } from './contexts/AssistantContext';
import { UserProvider } from './contexts/UserContext';
import { Canvas } from './components/canvas/canvas';

function App() {
  return (
    <Router>
      <UserProvider>
        <AssistantProvider>
          <ThreadProvider>
            <GraphProvider>
              <div className="app-container">
                {/* Your existing app header/navigation */}
                <main className="main-content">
                  <Canvas />
                </main>
              </div>
            </GraphProvider>
          </ThreadProvider>
        </AssistantProvider>
      </UserProvider>
    </Router>
  );
}
```

### 8. Connect to Backend

Configure the API connections in GraphContext to point to your LangGraph backend:

```typescript
// In GraphContext.tsx, update the fetch URL
const response = await fetch('YOUR_LANGRAPH_BACKEND_URL', {
  method: 'POST',
  // ...
});
```

## Detailed Component Breakdown

### 1. GraphContext.tsx (47KB)

This is the core state management component. Key features to implement:

- **State Management**: Manages artifacts, messages, streaming state
- **Stream Handling**: Processes streaming responses from LangGraph
- **Text Selection**: Manages selected text blocks for editing
- **Message State**: Tracks conversation messages
- **Artifact Updates**: Handles updating artifacts and content

Implementation details:
- Uses React Context API
- Manages WebSocket or SSE connections for streaming
- Parses LangGraph event formats
- Updates UI in real-time as tokens arrive

### 2. TextRenderer.tsx (9KB)

Handles markdown rendering and editing:

- **Rich Text Editing**: Uses BlockNote for WYSIWYG editing
- **Text Selection**: Enables selecting text passages
- **Raw/Rendered Views**: Toggle between raw markdown and rendered views
- **Content Updates**: Syncs edits back to GraphContext

Implementation details:
- Uses BlockNote for rich editing
- Implements selection handlers
- Converts between BlockNote format and markdown

### 3. ArtifactRenderer.tsx (14KB)

Manages rendering different types of artifacts:

- **Content Type Detection**: Determines if content is markdown or code
- **Selection Box**: Displays UI for text selection
- **Content Switching**: Handles switching between artifacts
- **Editor Integration**: Embeds TextRenderer and CodeRenderer

Implementation details:
- Manages artifact state and content types
- Handles user interactions with artifacts
- Provides contextual tools based on content type

### 4. Canvas.tsx (8KB)

Main container component that combines chat and canvas:

- **Resizable Panels**: Split view between chat and canvas
- **Collapsible Chat**: Allows collapsing the chat panel
- **Layout Management**: Handles overall layout

Implementation details:
- Uses resizable panel library for split view
- Integrates chat and artifact panels
- Manages UI state for collapsing/expanding

### 5. WebSearchResults.tsx

Displays web search results during AI generation:

- **Result Display**: Shows search results inline in chat
- **Status Indicators**: Shows loading/searching state
- **Result Integration**: Allows incorporating results into responses

## Handling Common Implementation Challenges

### 1. Stream Processing

The most complex part is handling streaming responses from LangGraph:

```typescript
// In GraphContext.tsx
const handleStreamChunk = (chunk: any) => {
  try {
    const data = JSON.parse(chunk);
    
    // Extract relevant fields
    const {
      runId,
      event,
      langgraphNode,
      nodeInput,
      nodeChunk,
      nodeOutput,
    } = data;
    
    // Handle different event types
    if (event === "on_chain_start") {
      // Handle chain start events
    } else if (event === "on_chain_stream") {
      // Handle streaming events
      if (nodeChunk?.chunk) {
        // Update UI with streamed token
      }
    } else if (event === "on_chain_end") {
      // Handle completion events
    }
  } catch (e) {
    console.error("Error processing stream chunk:", e);
  }
};
```

### 2. Text Selection Mechanism

Implementing text selection requires DOM manipulation:

```typescript
// In ArtifactRenderer.tsx
useEffect(() => {
  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const range = selection.getRangeAt(0);
    const text = range.toString();
    
    if (text && isSelectionWithinArtifact(range)) {
      const rect = range.getBoundingClientRect();
      setSelectionBox({
        text,
        position: {
          top: rect.bottom,
          left: rect.left + rect.width / 2,
        }
      });
    }
  };
  
  document.addEventListener('selectionchange', handleSelection);
  return () => document.removeEventListener('selectionchange', handleSelection);
}, []);
```

### 3. Rich Text Editing

Integrating BlockNote for rich editing:

```typescript
// In TextRenderer.tsx
const editor = useCreateBlockNote({
  initialContent: parseMarkdown(content),
});

useEffect(() => {
  const saveInterval = setInterval(() => {
    if (editor) {
      const markdown = convertToMarkdown(editor.document);
      onChange(markdown);
    }
  }, 1000);
  
  return () => clearInterval(saveInterval);
}, [editor, onChange]);
```

## Conclusion

By following this integration strategy, you can add Open Canvas functionality to your existing Vite application while minimizing reimplementation. The approach focuses on:

1. **Porting contexts first**: Set up the state management foundation
2. **Adapting components**: Modify components to work with Vite/React
3. **Replacing Next.js features**: Find React equivalents for Next.js specific features
4. **Connecting to backend**: Ensure proper communication with the LangGraph backend

The most critical components to focus on are:
1. **GraphContext.tsx** - The heart of the application's state management and stream handling
2. **Canvas/ArtifactRenderer/TextRenderer** - The core UI components for displaying and editing content
3. **Streaming implementation** - Ensuring proper handling of real-time AI responses

By methodically porting each component and adapting it to your Vite environment, you can successfully integrate the Open Canvas functionality while preserving its rich feature set. 