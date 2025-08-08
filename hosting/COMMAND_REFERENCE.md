# POV-CLI Command Reference

## Overview
Point-of-View CLI (POV-CLI) is an interactive terminal interface that provides AI-powered insights, context-aware resources, and consulting services through a modern command-line experience.

## Core Commands

### Basic Commands
- `help` - Show available commands
- `clear` - Clear the terminal screen
- `whoami` - Display information about Henry Reed
- `status` - Show system status and analytics

### Context & Information
- `ls` - List and explore context (use with flags like --all-products, --skills, --recent)
- `search "query"` - Search through knowledge base and documentation
- `contact` - Get contact information (--email, --linkedin, --schedule)
- `services` - Explore available AI services

### AI-Powered Features
- `cortex-questions "question"` - Save questions and get AI-powered insights
  - Aliases: `cq`, `ask-cortex`, `genai`
  - Features: Question persistence, AI analysis, context-aware responses
- `ai [prompt]` - Interact with the Henry Reed AI assistant
- `ctxpov` - Generate custom context point-of-view URLs and resources

## Advanced Commands

### URL Generation (ctxpov)
Generate custom URLs based on perspective:
- `ctxpov --cloud --c1` - Executive cloud strategy resources
- `ctxpov --cloud` - General cloud AI resources
- `ctxpov --c1` - C-level executive resources
- `ctxpov --enterprise` - Enterprise-focused solutions
- `ctxpov --startups` - Startup and scale-up resources
- `ctxpov --all` - All available context URLs

### Status & Analytics
- `status --detailed` - Detailed system status
- `status --analytics` - Usage analytics
- `status --performance` - Performance metrics

### Search & Discovery
- `search "query" --docs` - Search documentation only
- `search "query" --projects` - Search projects only
- `search "query" --insights` - Search insights only

## Command Aliases
- `help`: `?`, `man`
- `ls`: `list`, `dir`
- `whoami`: `me`, `info`
- `contact`: `reach`, `connect`
- `services`: `offerings`, `solutions`
- `clear`: `cls`
- `ai`: `ask`, `chat`
- `cortex-questions`: `cq`, `ask-cortex`, `genai`
- `ctxpov`: `ctx-pov`, `perspective`
- `search`: `find`, `lookup`
- `status`: `info`, `stats`

## Key Features

### 🧠 Cortex Questions (GenAI Integration)
The `cortex-questions` command demonstrates mock GenAI integration:
- Question persistence with unique IDs and timestamps
- AI-powered analysis with strategic points
- Contextual recommendations
- Suggested next actions
- Integration points for real GenAI services

### 🎯 Context Point-of-View (ctxpov)
Dynamic URL generation with:
- Session tracking
- Timestamp-based personalization
- Role-based content (C1, Enterprise, Startups)
- Context-aware resources

### 📊 System Analytics
Real-time status monitoring:
- System health indicators
- Usage analytics
- Performance metrics
- Uptime tracking

## Deployment

### Firebase Hosting
- Configured for Next.js static export
- Optimized for Firebase experimental web frameworks
- CDN caching for static assets
- Single-page application routing

### Build Process
```bash
npm run build    # Build and export static files
npm run deploy   # Build and deploy to Firebase
```

### Configuration Files
- `firebase.json` - Firebase hosting configuration
- `.firebaserc` - Firebase project configuration
- `next.config.ts` - Next.js static export settings

## Technical Implementation

### Architecture
- Next.js 15 with TypeScript
- Tailwind CSS for styling
- React hooks for state management
- Command parser with argument handling
- Modular command system

### Command System
- Extensible command configuration
- Alias support
- Flag-based arguments
- Dynamic help generation
- Command history with navigation

### UI/UX Features
- Terminal-themed interface
- ASCII art welcome message (XSIAM)
- Color-coded output
- Interactive command suggestions
- Tab completion
- Keyboard navigation (↑/↓ for history)

## Future Enhancements

### Planned Features
1. **Real GenAI Integration**
   - Replace mock responses with actual AI services
   - Persistent question storage
   - Advanced analytics

2. **Enhanced Search**
   - Full-text search capabilities
   - Vector-based semantic search
   - Real-time indexing

3. **User Authentication**
   - Personalized command history
   - User-specific contexts
   - Session persistence

4. **API Integration**
   - RESTful API endpoints
   - Webhook integrations
   - Third-party service connections

5. **Advanced Analytics**
   - Real usage tracking
   - Performance monitoring
   - User behavior analysis

## Development Commands
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run firebase:serve   # Test Firebase hosting locally
npm run firebase:init    # Initialize Firebase project
```

## Branding
- **Name**: POV-CLI (Point-of-View Command Line Interface)
- **Welcome Message**: XSIAM ASCII art
- **Theme**: Terminal-inspired with modern web technologies
- **Purpose**: AI consulting and services through interactive CLI
