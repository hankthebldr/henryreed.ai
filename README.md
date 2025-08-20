# Proof of Value CLI (PoV-CLI)

**An Interactive Terminal Interface for Cloud Application Security Scenarios**

[![Deploy to Firebase](https://img.shields.io/badge/deploy-Firebase-orange)](https://henryreedai.web.app)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

PoV-CLI is a modern, terminal-inspired web interface that provides cloud security insights, scenario testing, and interactive demonstrations through an intuitive command-line experience. Built with Next.js and TypeScript, it showcases advanced terminal functionality with support for both synchronous and asynchronous command execution.

![Terminal Screenshot](https://via.placeholder.com/800x400/1a1a1a/00ff00?text=PoV-CLI+Terminal+Interface)

## 🚀 Features

### 🎯 Core Functionality
- **Interactive Terminal Interface** - Modern terminal UI with command history and tab completion
- **Async Command Support** - Full support for asynchronous command handlers with loading indicators
- **Dynamic Help System** - Context-aware help with detailed command documentation
- **Command Aliases** - Multiple aliases for improved user experience
- **Real-time Status** - System analytics and performance monitoring

### 🔐 Cloud Security Features
- **OWASP Top 10 Reference** - Quick access to common web application risks
- **Scenario Management** - Deploy cloud security assessment scenarios
- **CDR Template Downloads** - Retrieve Cloud Detection and Response resources

### 🛠️ Technical Capabilities
- **Service Discovery** - Comprehensive listing of AI services and capabilities
- **Knowledge Base Search** - Advanced search through documentation and insights
- **Download Management** - Resource and template download functionality
- **Contact Integration** - Direct access to scheduling and contact information

## 🏗️ Architecture

### Frontend Stack
- **Next.js 15** - React framework with static export configuration
- **TypeScript** - Full type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Hooks** - Modern state management and lifecycle handling

### Backend Integration
- **Google Cloud Functions** - Serverless backend for scenario management
- **Firebase Hosting** - Static site hosting with CDN caching
- **Firebase Storage** - Asset and resource storage

### Command System
```typescript
interface CommandConfig {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: (args: string[]) => React.ReactNode | Promise<React.ReactNode>;
}
```

## 📁 Project Structure

```
.
├── hosting/                    # Next.js application
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── EnhancedTerminal.tsx   # Main terminal component
│   │   └── Terminal.tsx           # Base terminal component
│   ├── lib/                   # Library modules
│   │   ├── scenario-commands.tsx  # Scenario management commands
│   │   ├── scenario-types.ts      # Type definitions
│   │   ├── cloud-functions-api.ts # GCP integration
│   │   ├── commands.tsx           # Core commands
│   │   ├── commands-ext.tsx       # Extended commands
│   │   └── download-commands.tsx  # Download functionality
│   ├── package.json           # Dependencies and scripts
│   ├── next.config.ts         # Next.js configuration
│   └── firebase.json          # Firebase hosting config
├── deploy.sh                  # Deployment script
├── firebase.json              # Firebase project config
└── README.md                  # This file
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (Latest LTS version recommended)
- **npm** or **yarn**
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git** for version control

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/henryreed/henryreed.ai.git
   cd henryreed.ai
   ```

2. **Install dependencies:**
   ```bash
   cd hosting
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

1. **Build the application:**
   ```bash
   cd hosting
   npm run build
   ```

2. **Test locally:**
   ```bash
   npm run firebase:serve
   ```

## 🚀 Deployment

### Quick Deploy
Use the automated deployment script:
```bash
./deploy.sh
```

### Manual Deployment
1. **Build the application:**
   ```bash
   cd hosting
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   cd ..
   firebase deploy --only hosting
   ```

### Preview Deployment
For testing before production:
```bash
cd hosting
npm run deploy:preview
```

## 🎮 Available Commands

### Core Commands
- `help` - Show available commands and usage information
- `clear` - Clear the terminal screen
- `whoami` - Display information about Henry Reed
- `status` - Show system status and analytics

### Context & Information
- `ls ctx --all-products` - List all AI products and services
- `ls ctx --skills` - Display technical expertise
- `search "query"` - Search knowledge base and documentation
- `contact` - Get contact information and scheduling

### AI-Powered Features
- `cortex-questions "question"` - Save questions for AI analysis
- `ai [prompt]` - Interact with AI assistant
- `ctxpov` - Generate context point-of-view URLs

### Scenario Management
- `scenario list` - List available scenarios
- `scenario deploy [name]` - Deploy a scenario to GCP
- `scenario status [name]` - Check deployment status
- `scenario delete [name]` - Remove a scenario deployment

### Aliases
Most commands support aliases for faster typing:
- `help` → `?`, `man`
- `ls` → `list`, `dir`
- `contact` → `reach`, `connect`
- `cortex-questions` → `cq`, `ask-cortex`, `genai`

## ⚙️ Configuration

### Firebase Configuration
```json
{
  "hosting": {
    "public": "hosting/out",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### Next.js Configuration
```typescript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build and export the application
- `npm run deploy` - Build and deploy to Firebase Hosting
- `npm run deploy:preview` - Deploy to preview channel
- `npm run firebase:serve` - Serve built app locally
- `npm run firebase:emulators` - Start Firebase emulators

### Adding New Commands

1. **Define command configuration:**
   ```typescript
   const newCommand: CommandConfig = {
     name: 'mycommand',
     description: 'Description of what the command does',
     usage: 'mycommand [options]',
     aliases: ['mc', 'cmd'],
     handler: async (args: string[]) => {
       // Command implementation
       return <div>Command output</div>;
     }
   };
   ```

2. **Add to command configs array in `EnhancedTerminal.tsx`**

3. **Test locally and deploy**

### TypeScript Configuration
The project uses strict TypeScript with full type safety:
- All command handlers are properly typed
- Support for both sync and async command execution
- Comprehensive type definitions for scenarios and API responses

## 📊 Analytics & Monitoring

### Built-in Analytics
- System health indicators
- Command usage tracking
- Performance metrics
- Uptime monitoring

### Integration Ready
- Google Analytics 4 support
- Vercel Analytics integration
- Custom event tracking
- Real-time monitoring capabilities

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Firebase Hosting](https://firebase.google.com/products/hosting)
- ASCII art generated for terminal branding
- Terminal inspiration from classic CLI interfaces


---

**Built with ❤️ **
