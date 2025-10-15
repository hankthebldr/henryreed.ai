# User Timeline & Event System - Documentation

## Overview

The User Timeline & Event System provides comprehensive activity tracking and analytics for henryreed.ai. It automatically captures lifecycle changes across TRR records, Training Records, and Knowledge Base entries, transforming them into a normalized event stream that powers user timelines, dashboards, and POV/Tech Validation metrics.

**Think of it as a "SOC for consultant workflows":** Every state change becomes a signal, every signal becomes a metric, and every metric rolls up into actionable insights.

---

## Architecture

### Event-Driven Design

```
┌─────────────────┐
│  Domain Write   │  (TRR, Training, KB)
│  (Firestore)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cloud Function  │  (onWrite trigger)
│   Normalizer    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Timeline Event  │  (users/{uid}/events/{eventId})
│  (Immutable)    │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌────────────────┐  ┌──────────────────┐
│  User Stats    │  │  Daily Rollups   │
│ (Aggregates)   │  │   (Analytics)    │
└────────────────┘  └──────────────────┘
         │                  │
         └──────────┬───────┘
                    ▼
         ┌──────────────────┐
         │  Timeline UI     │
         │  (React Hook)    │
         └──────────────────┘
```

### Key Components

1. **Event Envelope** (`functions/src/types/timeline-events.ts`)
   - Canonical schema for all events
   - Immutable, append-only records
   - Rich metadata: actor, delta, context, correlation

2. **Domain Triggers** (`functions/src/handlers/timeline-event-handlers.ts`)
   - `trrOnWrite`, `trainingOnWrite`, `knowledgebaseOnWrite`
   - Normalize domain changes → timeline events
   - Update lightweight user stats

3. **Scheduled Rollups** (`functions/src/handlers/timeline-rollups.ts`)
   - Daily event aggregation (2 AM UTC)
   - Weekly metrics computation (Mondays 3 AM UTC)
   - Expired event cleanup (4 AM UTC)

4. **React Timeline UI** (`hosting/components/UserTimeline.tsx`)
   - Real-time or paginated event display
   - Filtering by source, action, date range
   - Activity stats dashboard

5. **Firestore Security** (`firestore.rules`)
   - User-owned timelines (read-only for owners)
   - Immutable events (no updates/deletes)
   - Admin full access

---

## Data Model

### Event Envelope

```typescript
{
  eventId: string;           // Auto-generated UUID
  userId: string;            // Owner of this event
  actor: {                   // Who performed the action
    uid: string;
    email?: string;
    role?: 'admin' | 'dc_admin' | 'manager' | 'user';
  };
  ts: Timestamp;             // Firestore server timestamp
  source: 'trr' | 'training' | 'knowledgebase' | 'ui' | 'system';
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | ...;
  object: {
    type: 'trr' | 'training' | 'knowledgebase';
    id: string;              // Document ID
    name: string;            // Human-readable name
    version?: number;
    status_before?: string;
    status_after?: string;
  };
  delta: {
    fields: string[];        // Changed field names
    diff?: Record<string, [any, any]>; // [before, after] for each field
  };
  context: {
    povId?: string;          // Associated POV
    tvStage?: 'TechValidation' | 'POV';
    scenarioId?: string;     // Associated scenario
    labels?: string[];       // Tags (MITRE, verticals, etc.)
  };
  correlationId?: string;    // Link related events
  severity: 'info' | 'notice' | 'warn' | 'error';
  ttlDays: number;           // Data retention period
}
```

### User Stats

```typescript
{
  lastActivityAt: Timestamp;
  countsByType: {
    trr?: number;
    training?: number;
    knowledgebase?: number;
  };
  countsByAction: {
    created?: number;
    updated?: number;
    status_changed?: number;
    completed?: number;
  };
  velocity7d?: number;   // Events per day (7-day rolling window)
  velocity30d?: number;  // Events per day (30-day rolling window)
}
```

### Firestore Collections

```
/users/{uid}/events/{eventId}          → Timeline events (immutable)
/users/{uid}/meta/stats                → Aggregated user stats
/analytics/daily_rollups/dates/{YYYY-MM-DD}  → Daily analytics
/analytics/weekly_rollups/weeks/{YYYY-WWW}   → Weekly metrics
```

---

## Deployment

### Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Active Firebase project with Firestore and Functions enabled

### Quick Start

```bash
# 1. Install dependencies
cd functions && npm install && cd ..

# 2. Build TypeScript
cd functions && npm run build && cd ..

# 3. Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# 4. Deploy Cloud Functions
firebase deploy --only functions:trrOnWrite,functions:trainingOnWrite,functions:knowledgebaseOnWrite,functions:onEventCreated,functions:dailyEventRollup,functions:weeklyStatsComputation

# 5. Deploy Next.js app (includes Timeline UI)
cd hosting && npm run build && npm run deploy
```

### Verify Deployment

```bash
# Check deployed functions
firebase functions:list

# View function logs
firebase functions:log --only trrOnWrite

# Test with emulators (local)
cd hosting && npm run firebase:emulators
```

---

## Usage

### 1. Add Timeline to Your UI

```tsx
import { UserTimeline } from '@/components/UserTimeline';
import { useAuth } from '@/contexts/AuthContext';

export function MyDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>My Activity</h1>
      <UserTimeline
        userId={user.uid}
        realtime={true}         // Enable real-time updates
        showStats={true}        // Display stats card
        showFilters={true}      // Show filter controls
      />
    </div>
  );
}
```

### 2. Query Events Programmatically

```tsx
import { useTimeline } from '@/hooks/useTimeline';

const { events, stats, loading, hasMore, loadMore } = useTimeline({
  userId: user.uid,
  filters: {
    source: 'trr',
    action: 'status_changed',
    startDate: new Date('2025-01-01'),
  },
  pageSize: 50,
  realtime: false,
});
```

### 3. Trigger Custom Events (Future)

For UI-driven events (non-domain changes), use a Callable Function:

```typescript
// functions/src/handlers/custom-events.ts
export const logUIEvent = onCall(async (request) => {
  const { action, context } = request.data;
  const userId = request.auth.uid;

  const event = createTimelineEvent({
    userId,
    source: 'ui',
    action,
    objectId: 'ui-action',
    objectType: 'ui' as any,
    objectName: action,
    context,
  });

  await db.collection('users').doc(userId).collection('events').doc(event.eventId).set(event);
});
```

---

## Demo Script (90 seconds)

### Step 1: Create a TRR

```bash
# Via Firestore or your TRR UI
{
  "title": "Acme Corp TRR",
  "status": "draft",
  "ownerUid": "user123",
  "labels": ["vertical:finance"],
  "povId": "pov-001"
}
```

**Expected:** Timeline event appears with `action: "created"`, `source: "trr"`

### Step 2: Update TRR Status

```bash
# Update TRR status to "approved"
status: "approved"
```

**Expected:** Timeline event with `action: "status_changed"`, delta shows `status: ["draft", "approved"]`

### Step 3: Complete a Training

```bash
# Create/complete a training record
{
  "topic": "XSIAM Fundamentals",
  "status": "completed",
  "ownerUid": "user123",
  "completedAt": Timestamp.now()
}
```

**Expected:** Timeline event with `action: "completed"`, `source: "training"`

### Step 4: Publish a KB Article

```bash
{
  "title": "Detection Best Practices",
  "status": "published",
  "ownerUid": "user123"
}
```

**Expected:** Timeline event with `action: "published"`, `source: "knowledgebase"`

### Step 5: View Timeline UI

Navigate to `/timeline` (or wherever you mount `<UserTimeline />`)

**Expected:**
- All 4 events displayed in chronological order
- Stats card shows counts by source
- Filters work (e.g., filter by `source: "trr"`)
- Velocity metrics computed (7d/30d)

---

## Analytics & Rollups

### Daily Rollups

Scheduled daily at 2 AM UTC, aggregates:
- Events by source/action
- Active users count
- Top 10 users by activity
- Status transition counts

**Query:**
```typescript
const rollup = await db
  .collection('analytics')
  .doc('daily_rollups')
  .collection('dates')
  .doc('2025-10-15')
  .get();
```

### Weekly Metrics

Computed every Monday at 3 AM UTC:
- Total events
- Avg events per day
- Unique active users
- Weekly trends

### Cleanup

Expired events (older than `ttlDays`, default 365) are deleted daily at 4 AM UTC.

---

## Indexes

All composite indexes are defined in `firestore.indexes.json`:

- **Primary:** `userId` + `ts` (DESC) — User timeline
- **Filtered:** `userId` + `source` + `ts` — Filter by domain
- **Granular:** `userId` + `source` + `action` + `ts` — Multi-filter
- **Correlation:** `correlationId` + `ts` — Track event sequences
- **POV Context:** `userId` + `context.povId` + `ts` — POV-scoped events
- **Global Admin:** `source` + `action` + `ts` — Cross-user analytics

**Deploy indexes:**
```bash
firebase deploy --only firestore:indexes
```

---

## Security

### Firestore Rules

- **Users can read their own timeline:** `users/{uid}/events` (owner or admin)
- **Events are immutable:** No updates or deletes allowed
- **Stats are read-only:** Only Cloud Functions write stats
- **Analytics admin-only:** Global rollups accessible to admins/managers

**Key rule:**
```javascript
match /users/{uid}/events/{eventId} {
  allow read: if isOwner(uid) || hasRole('admin');
  allow create: if false;  // Only Cloud Functions create events
  allow update, delete: if false;  // Immutable
}
```

---

## Troubleshooting

### Events Not Appearing

**Check:**
1. Cloud Functions deployed? `firebase functions:list`
2. Functions logs for errors: `firebase functions:log --only trrOnWrite`
3. Document has `ownerUid` field? (Required for event creation)
4. Firestore rules allow read? Check `users/{uid}/events` rules

### Permission Denied

**Check:**
1. User authenticated?
2. Trying to read own timeline? (`userId === auth.uid`)
3. Admin role for global analytics?

### Slow Queries

**Check:**
1. Composite indexes deployed? `firebase deploy --only firestore:indexes`
2. Query uses indexed fields? See `firestore.indexes.json`
3. Firestore console → Indexes → Check status

### Stats Not Updating

**Check:**
1. `onEventCreated` function deployed?
2. Function logs: `firebase functions:log --only onEventCreated`
3. Stats path: `users/{uid}/meta/stats` (not `users/{uid}/stats`)

---

## Roadmap & Extensions

### Optional Enhancements

1. **BigQuery Export**
   - Enable Firestore→BigQuery extension
   - Export `users/*/events` for long-term analytics
   - Build Looker Studio dashboards

2. **Event Hub SDK**
   - Wrap event creation in shared client library
   - Enforce envelope consistency
   - Add idempotency helpers

3. **Correlation IDs**
   - Link sequences (e.g., "Scenario Run #7")
   - Narrative playback across TRR/Training/KB

4. **POV Readout Generator**
   - Auto-assemble charts + KPIs from timeline
   - Export to PDF/slides (Functions + Puppeteer)

5. **MITRE Coverage Tracking**
   - Standardize `labels` (e.g., `mitre:tactic:TA0003`)
   - Generate coverage matrices from events

---

## API Reference

### useTimeline Hook

```typescript
const {
  events,       // TimelineEvent[]
  stats,        // UserStats | null
  loading,      // boolean
  error,        // Error | null
  hasMore,      // boolean
  loadMore,     // () => Promise<void>
  refresh,      // () => Promise<void>
} = useTimeline({
  userId: string;
  filters?: TimelineFilter;
  pageSize?: number;  // default: 50
  realtime?: boolean; // default: false
});
```

### Timeline Helper Functions

```typescript
// Create event from domain change
createTimelineEvent(params: CreateEventParams): TimelineEvent

// Compute delta between snapshots
computeDelta(before, after): EventDelta

// Determine action from change
determineAction(before, after): EventAction

// Extract owner from document
extractOwnerId(data): string | null
```

---

## File Structure

```
henryreed.ai/
├── functions/
│   ├── src/
│   │   ├── types/
│   │   │   └── timeline-events.ts       # Event types
│   │   ├── utils/
│   │   │   └── timeline-helpers.ts      # Pure functions
│   │   ├── handlers/
│   │   │   ├── timeline-event-handlers.ts  # Domain triggers
│   │   │   └── timeline-rollups.ts         # Scheduled jobs
│   │   └── index.ts                     # Exports
├── hosting/
│   ├── types/
│   │   └── timeline.ts                  # Client types
│   ├── hooks/
│   │   └── useTimeline.ts               # React hook
│   ├── components/
│   │   └── UserTimeline.tsx             # UI component
├── firestore.rules                      # Security rules
├── firestore.indexes.json               # Composite indexes
└── TIMELINE_SYSTEM_README.md            # This file
```

---

## Support & Feedback

- **Issues:** GitHub Issues (henryreed.ai repo)
- **Logs:** `firebase functions:log`
- **Emulators:** `npm run firebase:emulators` (local testing)

---

## Summary

You now have a production-ready, event-driven timeline system that:

✅ Automatically captures TRR, Training, and KB lifecycle changes
✅ Provides per-user immutable event streams
✅ Computes real-time and scheduled analytics
✅ Powers a React Timeline UI with filtering and search
✅ Enforces security via Firestore Rules (RBAC)
✅ Scales with composite indexes and scheduled rollups
✅ Deploys with `firebase deploy`

**Next Steps:**
1. Deploy with the commands above
2. Run the 90-second demo script
3. Integrate `<UserTimeline />` into your dashboard
4. Customize filters and stats for your POV/Tech Validation workflows

🚀 Ship it!
