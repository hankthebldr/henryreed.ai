# POV-CLI Terminal - Setup Guide

## Features

This enhanced POV-CLI terminal includes:

### 🎯 Uniform Output Formatting
- All terminal outputs are displayed in standardized text boxes
- Color-coded message types (success, error, warning, info, default)
- Consistent font sizing (14px monospace) throughout the terminal
- Improved readability and visual hierarchy

### 🔐 Firebase Authentication
- Email/password authentication
- Google OAuth integration
- Account creation and management
- Session persistence across visits
- User profile integration in terminal header

### 📖 Documentation Page
- Comprehensive documentation accessible via `docs` command
- Section-based navigation (Overview, Commands, Features, Examples, API)
- In-terminal help system with detailed command reference
- Usage examples and best practices

### ⌨️ Enhanced Terminal Experience
- Command history navigation with arrow keys
- Tab completion for command names
- Real-time feedback and loading states for async commands
- Responsive design for all screen sizes
- Custom scrollbar styling

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google providers
4. Create a Firestore database (optional, for future features)
5. Get your config from Project Settings > General > Your apps
6. Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the terminal.

### 4. Build for Production

```bash
npm run build
npm start
```

## Available Commands

### Basic Commands
- `help [command]` - Show available commands or detailed help
- `whoami [--detailed]` - Display information about Henry Reed
- `clear` - Clear the terminal screen

### Authentication
- `login` - Open login form to access premium features
- `logout` - Sign out of your account

### Navigation
- `docs [section]` - Open documentation page in new tab

### Keyboard Shortcuts
- `↑/↓ arrows` - Navigate command history
- `Tab` - Auto-complete command names
- `Enter` - Execute command

### Command Aliases
- `help` = `?`, `man`
- `whoami` = `me`, `info`
- `clear` = `cls`
- `login` = `auth`, `signin`
- `logout` = `signout`
- `docs` = `documentation`, `guide`

## Component Architecture

### Core Components
- `ImprovedTerminal` - Main terminal interface with enhanced features
- `TerminalOutput` - Uniform output formatting component
- `LoginForm` - Firebase authentication modal
- `AuthProvider` - Firebase authentication context

### Key Features of TerminalOutput Component
```typescript
interface TerminalOutputProps {
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info' | 'default';
}
```

Usage example:
```tsx
<TerminalOutput type="success">
  <div className="flex items-center">
    <div className="mr-3 text-2xl">✅</div>
    <div>
      <div className="font-bold">Operation Successful</div>
      <div className="text-sm text-gray-300 mt-1">
        Your request has been processed successfully.
      </div>
    </div>
  </div>
</TerminalOutput>
```

## File Structure

```
hosting/
├── app/
│   ├── docs/
│   │   └── page.tsx           # Documentation page
│   ├── globals.css            # Global styles with custom scrollbar
│   ├── layout.tsx             # Root layout with AuthProvider
│   └── page.tsx               # Main page with ImprovedTerminal
├── components/
│   ├── ImprovedTerminal.tsx   # Enhanced terminal with uniform output
│   ├── LoginForm.tsx          # Firebase authentication form
│   ├── EnhancedTerminal.tsx   # Original enhanced terminal
│   └── Terminal.tsx           # Basic terminal component
├── contexts/
│   └── AuthContext.tsx        # Firebase authentication context
├── lib/
│   ├── firebase-config.ts     # Firebase configuration
│   └── [other lib files]      # Existing library files
└── .env.example               # Environment variables template
```

## Development Notes

### Adding New Commands
1. Add command configuration to `commandConfigs` array in `ImprovedTerminal.tsx`
2. Use the `TerminalOutput` component for consistent formatting
3. Support both synchronous and asynchronous handlers
4. Include aliases and proper usage strings

### Styling Guidelines
- Use the `TerminalOutput` component for all command outputs
- Maintain consistent color scheme (green=success, red=error, etc.)
- Use 14px monospace font for all terminal text
- Include proper spacing and padding in text boxes

### Authentication Integration
- User state is available via `useAuth()` hook
- Check `user` object for authentication status
- Commands can show different outputs for authenticated users
- Use Firebase Auth methods through the context

## Deployment

The terminal can be deployed using the existing Docker and Kubernetes configurations in the parent directory. Make sure to:

1. Set up Firebase project and configure environment variables
2. Update the Docker build to include the `.env.local` file (or use environment injection)
3. Configure authentication providers in Firebase Console
4. Test all authentication flows in the deployed environment

For detailed deployment instructions, see the main `DEPLOYMENT.md` file in the project root.
