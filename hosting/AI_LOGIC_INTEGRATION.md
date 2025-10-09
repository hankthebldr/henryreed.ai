# Firebase AI Logic Integration Guide

## Overview

Firebase AI Logic is now integrated into the Cortex Domain Consultant platform, providing AI-powered features using Google's Gemini models.

## Setup

### 1. Environment Configuration

Add your Gemini API key to `.env.local`:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Getting an API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Copy it to your `.env.local` file

### 2. Verify Installation

Firebase AI Logic is included in Firebase SDK v12+. Check your installation:

```bash
npm list firebase
# Should show firebase@12.3.0 or higher
```

## Usage

### Basic Text Generation

```typescript
import { useAILogic } from '@/hooks/useAILogic';

function MyComponent() {
  const { generate, response, isLoading, error } = useAILogic();

  const handleGenerate = async () => {
    await generate('Explain cloud security best practices');
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        Generate
      </button>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {response && <div>{response}</div>}
    </div>
  );
}
```

### Streaming Responses

For real-time response streaming:

```typescript
function StreamingComponent() {
  const { streamGenerate, response, isLoading } = useAILogic();

  const handleStream = async () => {
    await streamGenerate('Write a detailed guide on detection engineering');
  };

  return (
    <div>
      <button onClick={handleStream}>Stream Response</button>
      <div className="whitespace-pre-wrap">{response}</div>
    </div>
  );
}
```

### Chat Sessions

Multi-turn conversations with context:

```typescript
import { useAIChat } from '@/hooks/useAILogic';

function ChatInterface() {
  const { sendMessage, messages, isLoading, clearChat } = useAIChat();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'user' : 'ai'}>
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />

      <button onClick={handleSend} disabled={isLoading}>
        Send
      </button>
      <button onClick={clearChat}>Clear</button>
    </div>
  );
}
```

## Specialized Features

### POV Recommendations

Generate tailored POV recommendations:

```typescript
function POVGenerator() {
  const { generatePOV, response, isLoading } = useAILogic();

  const handleGenerate = async () => {
    await generatePOV(
      'Customer wants to detect cloud account compromise',
      'Financial Services',
      ['Privileged access abuse', 'Data exfiltration', 'Compliance']
    );
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate POV</button>
      {isLoading && <p>Generating recommendations...</p>}
      {response && <div className="markdown-content">{response}</div>}
    </div>
  );
}
```

### Detection Scenario Generator

Create detection scenarios with MITRE mappings:

```typescript
function ScenarioGenerator() {
  const { generateScenario, response } = useAILogic();

  const handleGenerate = async () => {
    await generateScenario(
      'T1078 - Valid Accounts',
      'AWS'
    );
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Scenario</button>
      <div>{response}</div>
    </div>
  );
}
```

### Knowledge Base Enhancement

Auto-enhance knowledge base content:

```typescript
import { enhanceKnowledgeBaseContent } from '@/lib/aiLogicService';

async function enhanceDocument(content: string) {
  const metadata = await enhanceKnowledgeBaseContent(
    content,
    'security engineers'
  );

  console.log(metadata);
  // {
  //   summary: "Brief overview...",
  //   keywords: ["cloud", "security", "detection"],
  //   suggestedTags: ["aws", "threat-hunting"],
  //   complexity: "intermediate",
  //   relatedTopics: ["SIEM", "SOAR", "EDR"]
  // }
}
```

### Command Suggestions

AI-powered terminal command suggestions:

```typescript
function TerminalWithAI() {
  const { suggestCommands } = useAILogic();

  const getSuggestions = async () => {
    const suggestions = await suggestCommands(
      'User is analyzing CloudTrail logs',
      ['aws cloudtrail lookup-events', 'jq .Records']
    );

    console.log(suggestions);
    // ["aws cloudtrail get-event-selectors --trail-name...", ...]
  };

  return <button onClick={getSuggestions}>Get AI Suggestions</button>;
}
```

## Integration Examples

### 1. Knowledge Base Manager Integration

Update `KnowledgeBaseManager.tsx` to use AI enhancement:

```typescript
import { useAILogic } from '@/hooks/useAILogic';

// Inside component:
const { enhanceContent } = useAILogic();

const handleAIEnhance = async () => {
  if (!parsedData) return;

  const enhanced = await enhanceContent(parsedData.content);

  // Update metadata with AI suggestions
  setMetadata(prev => ({
    ...prev,
    keywords: enhanced.keywords,
    tags: enhanced.suggestedTags,
    complexity: enhanced.complexity,
    topics: enhanced.relatedTopics,
    description: enhanced.summary
  }));
};

// Add button in UI:
<button
  onClick={handleAIEnhance}
  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
>
  ✨ AI Enhance Metadata
</button>
```

### 2. Terminal Command Assistant

Enhance terminal with AI suggestions:

```typescript
// In ImprovedTerminal.tsx
import { generateCommandSuggestions } from '@/lib/aiLogicService';

const getAISuggestions = async () => {
  const context = `Current directory: ${currentDir}, User role: ${userRole}`;
  const suggestions = await generateCommandSuggestions(
    context,
    commandHistory
  );

  setSuggestedCommands(suggestions);
};
```

### 3. POV Creation Assistant

Add AI to POV creation workflow:

```typescript
// In POV creation form
const { generatePOV } = useAILogic();

const handleAIAssist = async () => {
  await generatePOV(
    povFormData.scenario,
    povFormData.industry,
    povFormData.challenges
  );

  // Display AI recommendations in sidebar
};
```

## Health Monitoring

Check AI Logic service health:

```typescript
import { healthCheck } from '@/lib/aiLogicService';

async function checkAIStatus() {
  const status = await healthCheck();

  if (status.status === 'healthy') {
    console.log('✅ AI Logic operational');
  } else {
    console.warn('⚠️ AI Logic issue:', status.message);
  }
}
```

## Model Selection

Available Gemini models:

- **gemini-2.5-flash** (default) - Fast, efficient for most tasks
- **gemini-2.5-pro** - More capable for complex reasoning
- **gemini-1.5-flash** - Legacy fast model
- **gemini-1.5-pro** - Legacy powerful model

Specify model in function calls:

```typescript
await generate('Your prompt', 'gemini-2.5-pro');
```

## Error Handling

Always handle errors gracefully:

```typescript
function RobustAIComponent() {
  const { generate, error, isLoading } = useAILogic();

  const handleGenerate = async () => {
    try {
      await generate('Your prompt');
    } catch (err) {
      // Error is automatically set in hook state
      console.error('AI generation failed:', err);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <p className="text-sm">
            Check your GEMINI_API_KEY configuration
          </p>
        </div>
      )}

      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
}
```

## Best Practices

### 1. API Key Security

- **Never** commit API keys to version control
- Use environment variables (`.env.local`)
- Add `.env.local` to `.gitignore`
- Use different keys for dev/staging/prod

### 2. Rate Limiting

Gemini API has rate limits:
- Implement debouncing for user input
- Show loading states
- Cache responses when appropriate

```typescript
import { debounce } from 'lodash';

const debouncedGenerate = debounce(async (prompt) => {
  await generate(prompt);
}, 500);
```

### 3. User Experience

- Show loading indicators
- Provide feedback for errors
- Allow users to cancel long-running requests
- Display streaming responses progressively

### 4. Cost Optimization

- Use `gemini-2.5-flash` for quick tasks
- Cache frequent responses
- Implement user confirmation for expensive operations

## Troubleshooting

### API Key Issues

**Error**: "GEMINI_API_KEY not configured"

**Solution**:
```bash
# Add to .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# Restart dev server
npm run dev
```

### Import Errors

**Error**: "Module 'firebase/ai' not found"

**Solution**:
```bash
# Ensure Firebase v12+ is installed
npm install firebase@latest

# Rebuild
npm run build
```

### Type Errors

If TypeScript complains about AI types:

```typescript
// Add to types/firebase-ai.d.ts
declare module 'firebase/ai' {
  export function getAI(app: any, config: any): any;
  export function getGenerativeModel(ai: any, config: any): any;
  export class GoogleAIBackend {}
}
```

## Next Steps

1. **Add UI Components**: Create reusable AI-powered components
2. **Integrate with Knowledge Base**: Auto-tag and categorize documents
3. **Terminal Assistant**: Context-aware command suggestions
4. **POV Builder**: AI-assisted POV creation workflow
5. **Scenario Generator**: Automated detection scenario templates

## Resources

- [Firebase AI Logic Docs](https://firebase.google.com/docs/ai-logic)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com)
- [Model Capabilities](https://ai.google.dev/gemini-api/docs/models/gemini)

## Support

For issues or questions:
1. Check Firebase AI Logic documentation
2. Review error messages in console
3. Verify API key configuration
4. Check Gemini API quotas and limits
