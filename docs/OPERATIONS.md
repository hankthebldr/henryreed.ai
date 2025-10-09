# Operations Guide - henryreed.ai

## Quick Start

### Prerequisites
- Node.js 20.x LTS
- npm 10.x
- Firebase CLI 14.x or newer
- Git

### Local Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd henryreed.ai
npm install
cd hosting && npm install
cd ../functions && npm install
```

2. **Start development environment:**
```bash
# Start hosting only
cd hosting && npm run dev

# Start with emulators
firebase emulators:start --only hosting,functions,firestore,storage
```

3. **Access the application:**
- Local dev: http://localhost:3000
- Firebase emulator: http://localhost:5000

## Building and Deployment

### Local Build Process

```bash
# Build hosting (Next.js static export)
cd hosting
npm run build:exp  # Uses experimental webpack features
# OR
npm run build     # Standard build

# Build functions
cd ../functions
npm run build
```

### Firebase Deployment

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
firebase deploy --only storage
```

### Environment Configuration

#### Hosting Environment Variables
Create `hosting/.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firebase Emulators

### Start Emulators
```bash
# All services
firebase emulators:start

# Specific services only
firebase emulators:start --only hosting,functions,firestore,storage
```

### Emulator Ports
- Hosting: http://localhost:5000
- Functions: http://localhost:5001
- Firestore: http://localhost:8080
- Storage: http://localhost:9199
- Emulator UI: http://localhost:4000

## Troubleshooting

### Common Build Issues

1. **TypeScript errors:**
```bash
cd hosting
npx tsc --noEmit
# OR
cd functions
npx tsc --noEmit
```

2. **Lint errors:**
```bash
cd hosting
npm run lint:fix
```

3. **Dependency issues:**
```bash
npm audit fix
npm dedupe
```

### Common Runtime Issues

1. **Authentication not working:**
   - Check Firebase Auth configuration
   - Verify environment variables
   - Check browser network tab for auth errors

2. **Functions not responding:**
   - Check Firebase Functions logs: `firebase functions:log`
   - Verify function deployment: `firebase functions:list`

3. **Build failures:**
   - Clear Next.js cache: `rm -rf hosting/.next hosting/out`
   - Clear node_modules: `rm -rf node_modules && npm install`

## Monitoring and Maintenance

### Health Checks

1. **Application health:**
```bash
curl -I https://henryreedai.web.app
# Should return 200 OK
```

2. **Function health:**
```bash
# Check if functions are deployed and responding
firebase functions:list
```

### Log Monitoring

1. **Firebase Console:**
   - Visit https://console.firebase.google.com/project/henryreedai
   - Navigate to Functions > Logs for function logs
   - Navigate to Hosting for deployment history

2. **Command-line logs:**
```bash
firebase functions:log
firebase hosting:logs
```

### Performance Monitoring

1. **Web Vitals:**
   - Check Firebase Console > Performance
   - Monitor Core Web Vitals metrics

2. **Function Performance:**
   - Monitor cold starts and execution time
   - Check memory and CPU usage

## Rollback Procedures

### Hosting Rollback

1. **Using Firebase Console:**
   - Go to Hosting section
   - Select previous deployment
   - Click "Rollback"

2. **Using CLI:**
```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID TARGET_SITE_ID
```

### Function Rollback

1. **Redeploy previous version:**
```bash
git checkout <previous_commit>
firebase deploy --only functions
```

2. **Emergency function disable:**
```bash
# Delete problematic function
firebase functions:delete functionName
```

## Backup and Recovery

### Data Backup

1. **Firestore backup:**
```bash
gcloud firestore export gs://your-backup-bucket/firestore-backup
```

2. **Storage backup:**
```bash
gsutil -m cp -r gs://your-project.appspot.com gs://your-backup-bucket/storage-backup
```

### Code Backup

1. **Git tags for releases:**
```bash
git tag -a v2.6.0 -m "Production release v2.6.0"
git push origin v2.6.0
```

## Security Maintenance

### Regular Security Tasks

1. **Update dependencies:**
```bash
npm audit
npm update
```

2. **Review Firestore rules:**
```bash
firebase firestore:rules:get
```

3. **Review Storage rules:**
```bash
firebase storage:rules:get
```

### Access Control

1. **Review IAM roles:**
   - Check Firebase Console > Project Settings > Users and permissions
   - Review service account permissions in GCP Console

2. **Audit authentication:**
   - Review Firebase Auth users
   - Check for suspicious activity in Auth logs

## CI/CD Pipeline

### GitHub Actions Workflow

The deployment is automated via GitHub Actions. To trigger deployment:

1. **Push to main branch:**
```bash
git push origin main
```

2. **Manual workflow dispatch:**
   - Go to GitHub Actions tab
   - Select "Deploy" workflow
   - Click "Run workflow"

### Pipeline Stages

1. **Lint and type check**
2. **Build hosting and functions**
3. **Run tests**
4. **Deploy to Firebase**
5. **Post-deployment verification**

## Contact and Support

### Development Team
- Primary maintainer: Henry Reed
- Repository: https://github.com/henryreed/henryreed.ai

### Firebase Project
- Project ID: henryreedai
- Console: https://console.firebase.google.com/project/henryreedai
- Live URL: https://henryreedai.web.app