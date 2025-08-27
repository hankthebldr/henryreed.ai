#!/bin/bash

# Deploy script for Henry Reed AI website
# This script builds the Next.js app and deploys to Firebase Hosting

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Navigate to hosting directory
cd hosting

echo "📦 Building Next.js application with experimental webpack..."
npm run build:exp

# Navigate back to root for Firebase deployment
cd ..

echo "🔥 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your site is available at: https://henryreedai.web.app"
