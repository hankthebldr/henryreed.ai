#!/bin/bash
#
# Timeline System Deployment Script
#
# Deploys the User Timeline & Event System to Firebase
#

set -e

echo "========================================="
echo " Timeline System Deployment"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build Cloud Functions
echo -e "${YELLOW}[1/4] Building Cloud Functions...${NC}"
cd functions
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Functions build failed${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✓ Functions built successfully${NC}"
echo ""

# Step 2: Deploy Firestore Rules and Indexes
echo -e "${YELLOW}[2/4] Deploying Firestore rules and indexes...${NC}"
firebase deploy --only firestore:rules,firestore:indexes
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Firestore deployment failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Firestore rules and indexes deployed${NC}"
echo ""

# Step 3: Deploy Cloud Functions
echo -e "${YELLOW}[3/4] Deploying Cloud Functions...${NC}"
echo "Deploying timeline event handlers:"
echo "  - trrOnWrite"
echo "  - trainingOnWrite"
echo "  - knowledgebaseOnWrite"
echo "  - trrsOnWrite"
echo "  - onEventCreated"
echo "  - dailyEventRollup"
echo "  - weeklyStatsComputation"
echo "  - cleanupExpiredEvents"
echo ""

firebase deploy --only \
  functions:trrOnWrite,\
functions:trainingOnWrite,\
functions:knowledgebaseOnWrite,\
functions:trrsOnWrite,\
functions:onEventCreated,\
functions:dailyEventRollup,\
functions:weeklyStatsComputation,\
functions:cleanupExpiredEvents

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Functions deployment failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
echo ""

# Step 4: Verify Deployment
echo -e "${YELLOW}[4/4] Verifying deployment...${NC}"
firebase functions:list | grep -E "(trrOnWrite|trainingOnWrite|knowledgebaseOnWrite|onEventCreated|dailyEventRollup)"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Functions verified${NC}"
else
    echo -e "${RED}⚠ Functions verification incomplete${NC}"
fi
echo ""

echo "========================================="
echo -e "${GREEN}✨ Timeline System Deployed Successfully!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Test with a TRR/Training/KB document write"
echo "  2. Query events: users/{uid}/events"
echo "  3. Check user stats: users/{uid}/meta/stats"
echo "  4. View function logs: firebase functions:log --only trrOnWrite"
echo ""
echo "UI Integration:"
echo "  import { UserTimeline } from '@/components/UserTimeline';"
echo "  <UserTimeline userId={user.uid} realtime={true} />"
echo ""
