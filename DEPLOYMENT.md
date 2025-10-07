# Cortex DC Portal - Firebase Deployment Guide

This guide covers deploying the Cortex DC Portal application using Firebase services and Google Cloud Platform.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Google Cloud SDK** (for advanced configuration)
- **Git** for version control
- **Firebase Project** with enabled services

## Firebase Services Architecture

```
henryreed.ai/
├── hosting/                    # Next.js Static Application
│   ├── out/                   # Build output (generated)
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   ├── next.config.ts         # Next.js configuration
│   └── package.json           # Frontend dependencies
├── functions/                 # Default Cloud Functions
│   ├── src/                   # Function source code
│   ├── package.json           # Function dependencies
│   └── .env                   # Environment variables
├── henryreedai/              # Genkit AI Functions
│   ├── src/                   # AI function source
│   └── package.json           # AI function dependencies
├── dataconnect/              # PostgreSQL Data Connect
│   ├── schema/               # Database schema
│   └── dataconnect.yaml      # Data Connect configuration
├── firebase.json             # Firebase project configuration
├── .firebaserc               # Firebase project aliases
└── deploy.sh                 # Automated deployment script
```

## Local Development

### Setup and Installation

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/henryreed/henryreed.ai.git
   cd henryreed.ai/hosting
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   # Application runs on http://localhost:3000
   ```

3. **Run with Firebase emulators**:
   ```bash
   npm run firebase:emulators
   # Starts all Firebase services locally
   ```

### Local Build Testing

1. **Build static export**:
   ```bash
   cd hosting
   npm run build
   ```

2. **Test with Firebase emulator**:
   ```bash
   npm run firebase:serve
   # Serves built app on http://localhost:5000
   ```

3. **Health check**:
   ```bash
   curl http://localhost:3000
   curl http://localhost:5000  # For emulator
   ```

## Firebase Production Deployment

### Automated Deployment (Recommended)

1. **Use deployment script**:
   ```bash
   # From project root
   ./deploy.sh
   ```

2. **Verify deployment**:
   ```bash
   firebase hosting:channel:list
   # Check https://henryreedai.web.app
   ```

### Manual Deployment

1. **Login to Firebase**:
   ```bash
   firebase login
   ```

2. **Build application**:
   ```bash
   cd hosting
   npm run build
   ```

3. **Deploy to Firebase Hosting**:
   ```bash
   cd ..
   firebase deploy --only hosting
   ```

4. **Deploy functions (if changed)**:
   ```bash
   firebase deploy --only functions
   ```

5. **Verify deployment**:
   ```bash
   firebase hosting:sites:list
   curl https://henryreedai.web.app
   ```

### Preview Channel Deployment

1. **Create preview channel**:
   ```bash
   cd hosting
   npm run deploy:preview
   ```

2. **Get preview URL**:
   ```bash
   firebase hosting:channel:list
   # Returns temporary preview URL
   ```

3. **Promote to production** (after testing):
   ```bash
   firebase hosting:channel:clone preview:latest live
   ```

## Configuration Management

### Environment Variables

The application supports the following environment variables:

**Frontend (Next.js):**
```env
# Firebase configuration (auto-configured)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Feature flags
NEXT_PUBLIC_USE_FUNCTIONS=1
NEXT_PUBLIC_AI_ENABLED=true
NEXT_PUBLIC_AUTH_PROVIDER=local
```

**Cloud Functions:**
```env
# OpenAI integration
OPENAI_API_KEY=your-openai-key

# Database connections
FIRESTORE_PROJECT_ID=your-project-id
DATACONNECT_DATABASE_URL=your-postgres-url
```

### Firebase Service Configuration

**Hosting Performance:**
- Global CDN with edge caching
- Automatic HTTPS with managed certificates
- HTTP/2 support
- Static asset optimization

**Function Scaling:**
- Automatic scaling based on request volume
- Cold start optimization
- Regional deployment options
- Memory and timeout configuration

## Monitoring and Performance

### Application Health Monitoring

**Built-in Health Checks:**
```bash
# Test application health
curl https://henryreedai.web.app

# Check Firebase hosting status
firebase hosting:sites:list

# Monitor function performance
firebase functions:log
```

### Performance Metrics

**Core Web Vitals:**
- **LCP (Largest Contentful Paint)**: <2.5s (optimized static assets)
- **FID (First Input Delay)**: <100ms (client-side hydration)
- **CLS (Cumulative Layout Shift)**: <0.1 (stable layouts)

**Firebase Analytics:**
```bash
# View hosting analytics
firebase hosting:channel:list

# Check function invocation metrics
firebase functions:list
```

### Log Management

```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only functions:functionName

# Real-time log streaming
firebase functions:log --follow
```

## Security Considerations

### Firebase Security Rules

```javascript
// Firestore rules example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.token.email.matches('.*@henryreed.ai');
    }
  }
}
```

### Environment Security

```bash
# Set production environment variables
firebase functions:config:set \
  openai.api_key="your-key" \
  app.environment="production"
```

### Access Control
- Domain-based authentication restrictions
- Role-based feature gating  
- Audit logging for all critical operations

## Troubleshooting

### Common Deployment Issues

**Build Failures:**
```bash
# Clear Next.js cache
rm -rf hosting/.next hosting/out
cd hosting && npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

**Firebase Deployment Errors:**
```bash
# Re-authenticate
firebase logout
firebase login

# Check project configuration
firebase projects:list
firebase use your-project-id
```

**Function Deployment Issues:**
```bash
# Check function logs
firebase functions:log

# Redeploy specific function
firebase deploy --only functions:functionName
```

### Performance Optimization

**Build Optimization:**
- Use Turbopack for faster development builds
- Enable static export for optimal CDN caching
- Implement code splitting for large components

**Runtime Optimization:**
- Configure appropriate cache headers
- Optimize image loading and sizing
- Implement proper error boundaries

## Best Practices

### Development Workflow
1. **Use preview channels** for testing changes
2. **Monitor function costs** and performance
3. **Implement proper error handling** throughout
4. **Use TypeScript** for better code quality
5. **Follow Firebase security best practices**

### Production Readiness Checklist
- ✅ Environment variables configured
- ✅ Security rules implemented
- ✅ Monitoring and alerting setup
- ✅ Backup and recovery procedures
- ✅ Performance optimization applied

---

**🚀 Production URL**: [henryreedai.web.app](https://henryreedai.web.app)  
**📚 Documentation**: See [README.md](README.md) for additional details
