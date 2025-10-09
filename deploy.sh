#!/usr/bin/env bash
# Enhanced Firebase deployment script with multi-service support
set -euo pipefail

PROJECT=$(firebase use --json | jq -r '.active')
echo "🚀 Deploying to Firebase Project: $PROJECT"
echo "📊 Environment: Node $(node -v) | Firebase $(firebase --version)"

# Pre-deployment validation
echo "🔍 Running pre-deployment checks..."
npm --prefix hosting run type-check
npm --prefix hosting run lint || echo "⚠️  Lint warnings found"

# Build all components
echo "🏗️  Building hosting application..."
npm --prefix hosting ci --silent
npm --prefix hosting run build

echo "🔧 Building functions..."
npm --prefix functions ci --silent && npm --prefix functions run build
npm --prefix henryreedai ci --silent && npm --prefix henryreedai run build

# Apply Data Connect if available
if firebase dataconnect:apply --help >/dev/null 2>&1; then
    echo "🗃️  Applying Data Connect configuration..."
    (cd dataconnect && firebase dataconnect:apply --project "$PROJECT" --non-interactive --force)
else
    echo "ℹ️  Data Connect CLI not available, skipping..."
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only functions,hosting,firestore:rules,storage:rules

# Post-deployment health checks
echo "🏥 Running post-deployment health checks..."
sleep 5
curl -f -s -I "https://henryreedai.web.app" > /dev/null && echo "✅ Hosting health check passed" || echo "❌ Hosting health check failed"

echo "✅ Deployment complete!"
echo "🌐 Production URL: https://henryreedai.web.app"
