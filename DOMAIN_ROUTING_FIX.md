# Domain Routing Issue - Resolution Guide

## Problem Summary

Your Firebase project has **two different hosting solutions** running simultaneously:

1. **Firebase Hosting** (Static Site) - Serves from `hosting/out` directory
   - URL: `https://henryreedai.web.app`
   - Content: Your current Next.js static export
   - Last deployed: Oct 9, 2025 15:23:46
   - Title: "Cortex Domain Consultant Platform"

2. **Firebase App Hosting** (Server-side) - Different application
   - Backend: `webapp-hankthebldr-serverside`
   - URL: `https://webapp-hankthebldr-serverside--henryreedai.us-central1.hosted.app`
   - Repository: `hankthebldr-henryreed.ai`
   - Last updated: Oct 9, 2025 10:52:05
   - Title: (Different minimal terminal interface)

**The Issue**: Your custom domain `henryreed.ai` is currently pointed to the **App Hosting backend** (the older/different application), NOT your Firebase Hosting static site (the application in this repository).

## Evidence

### Custom Domain (`henryreed.ai`)
```
Title: (Minimal terminal interface)
Headers:
  - x-fah-adapter: nextjs-14.0.17  ← App Hosting
  - x-nextjs-cache: HIT
  - server: envoy  ← Cloud Run (App Hosting backend)
DNS: 199.36.158.100, 35.219.200.15  ← App Hosting IPs
```

### Firebase Hosting (`henryreedai.web.app`)
```
Title: "Cortex Domain Consultant Platform"
Headers:
  - content-security-policy: (your custom CSP)
  - cache-control: max-age=3600
  - Static export from hosting/out directory
```

## Solution Options

### Option 1: Point Custom Domain to Firebase Hosting (Recommended)

This will make `henryreed.ai` serve your current application from the `hosting/out` directory.

**Steps:**

1. **Add custom domain to Firebase Hosting:**
   ```bash
   firebase hosting:sites:get henryreedai
   ```

2. **In Firebase Console:**
   - Go to: https://console.firebase.google.com/project/henryreedai/hosting
   - Click "Add custom domain"
   - Enter: `henryreed.ai`
   - Follow DNS setup instructions
   - Firebase will provide A/AAAA records to update

3. **Update DNS records at your domain registrar:**
   Replace the current A records with Firebase Hosting's IPs:
   ```
   Current (App Hosting):
   199.36.158.100
   35.219.200.15

   Change to (Firebase Hosting):
   Will be provided by Firebase Console
   (typically: 151.101.x.x, 151.101.x.x)
   ```

4. **Wait for DNS propagation** (5-30 minutes)

5. **Verify:**
   ```bash
   curl -sI https://henryreed.ai | grep -E "title|cache-control"
   ```

### Option 2: Keep Both, Use Subdomains

If you need both applications accessible:

- `henryreed.ai` → Firebase Hosting (this repository)
- `app.henryreed.ai` → App Hosting backend
- `preview.henryreed.ai` → Preview channel

**Steps:**

1. **Point root domain to Firebase Hosting** (see Option 1)

2. **Add subdomain for App Hosting:**
   - In Firebase Console → App Hosting
   - Add custom domain: `app.henryreed.ai`
   - Update DNS with provided CNAME/A records

### Option 3: Migrate App Hosting to This Repository

If the App Hosting backend is outdated and you want everything in this repo:

1. **Remove App Hosting backend:**
   ```bash
   # List backends
   firebase apphosting:backends:list

   # Delete the backend (if no longer needed)
   # firebase apphosting:backends:delete webapp-hankthebldr-serverside
   ```

2. **Point domain to Firebase Hosting** (see Option 1)

## Quick Fix Commands

### Check current domain status:
```bash
# Check what's serving on custom domain
curl -sI https://henryreed.ai | head -20

# Check Firebase Hosting
curl -sI https://henryreedai.web.app | head -20

# Check DNS
dig henryreed.ai +short
```

### List all hosting targets:
```bash
# Firebase Hosting sites
firebase hosting:sites:list

# App Hosting backends
firebase apphosting:backends:list

# Hosting channels
firebase hosting:channel:list
```

### Deploy to correct target:
```bash
# From hosting directory - deploys to Firebase Hosting only
cd hosting
npm run deploy

# This runs: npm run build:exp && cd .. && firebase deploy --only hosting
```

## Recommended Action Plan

**Immediate (5 minutes):**

1. Determine which application should be on `henryreed.ai`
   - If THIS repository → Follow Option 1
   - If the App Hosting backend → No action needed
   - If both needed → Follow Option 2

**Short-term (30 minutes):**

2. Update DNS records at your domain registrar
3. Add custom domain in Firebase Console
4. Verify domain ownership
5. Wait for DNS propagation

**Verification (5 minutes):**

6. Test the custom domain:
   ```bash
   # Should show "Cortex Domain Consultant Platform" if pointing to Firebase Hosting
   curl -s https://henryreed.ai | grep -o "<title>[^<]*</title>"
   ```

7. Test the Firebase Hosting URL (should always work):
   ```bash
   curl -s https://henryreedai.web.app | grep -o "<title>[^<]*</title>"
   ```

## Current Deployment Status

### Firebase Hosting (This Repo)
- **Site ID**: henryreedai
- **Public directory**: hosting/out
- **Deploy command**: `npm run deploy` (from hosting directory)
- **Live URL**: https://henryreedai.web.app
- **Channels**:
  - `live` - Production (Oct 9, 15:23:46)
  - `preview` - Testing (Oct 9, 10:02:05)

### App Hosting (Different Repo)
- **Backend**: webapp-hankthebldr-serverside
- **Repository**: hankthebldr-henryreed.ai
- **URL**: https://webapp-hankthebldr-serverside--henryreedai.us-central1.hosted.app
- **Custom Domain**: henryreed.ai ← **This is the issue**
- **Updated**: Oct 9, 10:52:05

## Firebase Console Links

- **Hosting Dashboard**: https://console.firebase.google.com/project/henryreedai/hosting
- **App Hosting**: https://console.firebase.google.com/project/henryreedai/apphosting
- **Custom Domains**: https://console.firebase.google.com/project/henryreedai/hosting/sites/henryreedai

## Updated Deployment Commands

Your current deployment workflow is **correct** for Firebase Hosting:

```bash
# From /hosting directory:
npm run deploy

# Or manually:
npm run build:exp
cd ..
firebase deploy --only hosting
```

**Do NOT use** `firebase deploy` without `--only hosting` unless you want to deploy everything (functions, firestore rules, App Hosting, etc.).

## Next Steps

1. **Decide**: Which application should be on `henryreed.ai`?
2. **Execute**: Follow the appropriate option above
3. **Verify**: Test both URLs to confirm routing
4. **Document**: Update your deployment docs with the chosen configuration

---

**Status**: Awaiting decision on which application should serve henryreed.ai
**Recommendation**: Point henryreed.ai to Firebase Hosting (this repository) as it appears to be the active/current application.
