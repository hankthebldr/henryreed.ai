# Badass Blueprint Multi-Modal Feature Design

## Overview
The Badass Blueprint capability augments the Domain Consultant (DC) workflow by synthesizing all POV and TRR artifacts into an executive-grade briefing package. The feature is implemented as a multi-modal extension that:

1. Embeds the blueprint generation entry point inside each POV record and TRR timeline.
2. Collects structured and unstructured engagement signals (notes, scenario outputs, attachments, scoring matrices) to curate a transformation narrative.
3. Generates two deliverables in a single operation:
   - **Executive Summary PDF**: a polished, branded artifact that combines metrics, timelines, recommendations, and AI-generated visual aides.
   - **Artifact Bundle**: a compressed package uploaded to Firebase Storage containing all supporting evidence and render assets (markdown, prompts, JSON context, images).
4. Emits analytical data to BigQuery for post-engagement insights, trend analysis, and quality review.

The design below covers UX additions, backend services, data modeling, observability, and rollout considerations.

## Goals & Non-Goals
**Goals**
- One-click generation of a transformation blueprint from a POV/TRR workspace.
- Automatic capture of multi-modal context (text, tables, images, audio transcripts) linked to the originating engagement.
- Reliable PDF export aligned with Cortex branding and existing download patterns.
- Artifact persistence with traceable metadata (storage URL, checksum, retention tags).
- BigQuery export for downstream analytics (executive summary stats, recommendation coverage, customer adoption signals).

**Non-Goals**
- Replacing existing POV/TRR editing flows.
- Building a standalone blueprint designer (the feature reuses scenario engine blueprints when available).
- Delivering real-time collaborative editing (future iteration).

## User Personas & Journeys
1. **Domain Consultant (Primary)**
   - From a POV record, triggers "Generate Badass Blueprint".
   - Reviews auto-populated sections, optionally adjusts emphasis tags (wins, risks, roadmap).
   - Downloads the PDF or shares Storage bundle URL with stakeholders.
2. **Engagement Manager (Secondary)**
   - Monitors blueprint generation history to ensure quality.
   - Uses BigQuery dashboard to compare blueprint velocity, coverage, and customer satisfaction indicators.
3. **Data Analyst (Tertiary)**
   - Queries BigQuery tables to correlate blueprint recommendations with follow-on revenue or deployment conversion.

## Functional Requirements
1. **Entry Point & Context Gathering**
   - Button/command within POV detail and TRR timeline views.
   - Auto-injects engagement context: customer metadata, scenario IDs, TRR status, strategic notes, attachments, metrics, and AI insight tags.
   - Supports manual overrides for executive tone (e.g., "accelerated modernization", "risk mitigation focus").

2. **Multi-Modal Extension Execution**
   - Runs inside the multi-modal extension bus already used for advanced AI commands.
   - Accepts structured JSON context plus references to Storage assets (screenshots, call recordings transcripts).
   - Produces a normalized `BadassBlueprintPayload` with sections: Executive Summary, Engagement Timeline, Scenario Outcomes, Recommendations, Next Steps, Appendices.

3. **PDF Rendering Pipeline**
   - Uses existing PDF export utilities (Playwright + Tailwind template) but extends templates with blueprint-specific layout.
   - Incorporates dynamic charts (progress bars, heatmaps) using the metrics from TRR/POV records.
   - Publishes PDF to Storage and returns signed download URL.

4. **Artifact Bundling**
   - Collects raw AI prompts/responses, context JSON, and derived assets into a ZIP bundle.
   - Stores under `engagementArtifacts/{engagementId}/blueprint/{timestamp}/bundle.zip` with metadata linking to Firestore document.

5. **Analytics Export**
   - Writes summary row per blueprint to BigQuery dataset `engagement_reporting.badass_blueprints`.
   - Schema includes engagement identifiers, blueprint scoring (confidence, automation coverage), recommendation categories, generation latency, and PDF size.

6. **Auditability & Governance**
   - Logs blueprint generation events in Firestore `activityFeed` with references to generated files.
   - Enforces role-based access using existing `engagementRoles` and ensures BigQuery export respects data residency.

## Data Model Additions
### Firestore
- **Collection:** `badassBlueprints`
  - `id`: string (doc ID)
  - `engagementId`: string (POV/TRR composite key)
  - `customerName`: string
  - `generatedBy`: string (user ID)
  - `generatedAt`: timestamp
  - `contextSnapshot`: map (subset of POV/TRR data used by extension)
  - `pdf`: map `{ storagePath, downloadUrl, checksumSha256, bytes, brandTheme }`
  - `artifactBundle`: map `{ storagePath, checksumSha256, bytes }`
  - `extensionRun`: map `{ extensionId, version, prompts, completionTokens, latencyMs }`
  - `analytics`: map `{ recommendationCoverage, riskScore, automationConfidence, bigQueryJobId }`
  - `status`: enum (`queued`, `processing`, `succeeded`, `failed`)
  - `error`: optional map `{ message, stacktraceRef }`

- **Subcollection:** `notes`
  - Stores manual adjustments and reviewer annotations for QA, enabling iterative improvements before re-exporting.

### BigQuery (Dataset: `engagement_reporting`)
- Table: `badass_blueprints`
  - `blueprint_id` STRING
  - `engagement_id` STRING
  - `customer_name` STRING
  - `pov_type` STRING (e.g., "xsiam", "cloud-secops")
  - `trr_phase` STRING
  - `generated_at` TIMESTAMP
  - `generated_by` STRING
  - `recommendation_categories` ARRAY<STRING>
  - `risk_score` FLOAT64
  - `automation_confidence` FLOAT64
  - `delivery_latency_ms` INT64
  - `pdf_storage_path` STRING
  - `artifact_bundle_path` STRING
  - `executive_theme` STRING
  - `notes_count` INT64
  - `scenario_count` INT64
  - `transcript_tokens` INT64
  - Partitioned by `DATE(generated_at)` for cost control.

## Architecture & Flow
### Components
1. **Frontend (Next.js Portal & POV CLI)**
   - Adds `Generate Badass Blueprint` action in POV detail UI and CLI command `pov --badass-blueprint` enhancements.
   - Captures user-selected emphasis (wins, risks, roadmap horizon) and passes to backend as part of payload.
   - Displays generation status with optimistic updates using Firestore listeners.

2. **Extension Orchestrator (Cloud Functions)**
   - New HTTPS callable function `generateBadassBlueprint` registered under `/extensions/badass-blueprint`.
   - Validates access, loads POV/TRR context via Dataconnect SDK, and constructs `ExtensionRunRequest`.
   - Dispatches to the Multi-Modal Extension runtime (reusing AI router with image/table attachments) and handles streaming updates.

3. **Rendering Service**
   - Dedicated background function `renderBadassBlueprintPdf` triggered by Firestore document writes (`status == 'processing'`).
   - Uses Puppeteer/Playwright templates stored in `hosting/templates/blueprint/`.
   - After rendering, uploads PDF and updates Firestore doc (`status = 'ready'`).

4. **Artifact Bundler**
   - Cloud Function `bundleBlueprintArtifacts` triggered post-PDF upload to gather prompts, context JSON, charts, and store zipped bundle.
   - Writes metadata to Firestore and notifies BigQuery exporter via Pub/Sub.

5. **BigQuery Exporter**
   - Cloud Function `exportBlueprintAnalytics` subscribed to Pub/Sub topic `blueprint.artifacts.ready`.
   - Transforms Firestore document into BigQuery row using streaming inserts with retry/backoff.

6. **Storage Bucket**
   - Uses existing Firebase Storage bucket with new folder conventions. Applies lifecycle policies (180-day retention, manual hold tags for regulated accounts).

### Sequence Flow
1. **User Action**: DC clicks "Generate Badass Blueprint" in UI.
2. **Context Assembly**: Frontend calls `generateBadassBlueprint` with engagement ID and optional emphasis overrides.
3. **Extension Run**: Function fetches engagement data, attaches transcripts/images, and invokes multi-modal extension (Gemini/GPT) with curated prompt.
4. **Draft Payload**: Extension returns structured sections, inline charts definitions, and recommended visuals.
5. **Firestore Write**: Function persists `badassBlueprint` document with `status='processing'` and stores raw payload in Storage for traceability.
6. **PDF Render Trigger**: Background renderer builds PDF, uploads to Storage, and updates Firestore with download URL and metrics.
7. **Artifact Bundle**: Bundler aggregates assets, creates ZIP, updates Firestore, publishes Pub/Sub event.
8. **Analytics Export**: Exporter streams summary row to BigQuery. Firestore doc transitions to `status='succeeded'`.
9. **UI Update**: Firestore listener refreshes UI with download link, BigQuery job status, and shareable artifact details.

## Multi-Modal Prompt Strategy
- **System Prompt**: Reinforces executive tone, brand voice, and structural requirements.
- **Context Attachments**:
  - JSON: aggregated metrics, TRR risk summary, scenario outcomes.
  - Markdown: curated notes and narrative cues.
  - Images: imported architecture diagrams or before/after screenshots.
  - Audio Transcripts: optional appended text (converted via Speech-to-Text) chunked with speaker labels.
- **Output Contract**: Enforced via JSON schema ensuring sections contain `title`, `summary`, `details`, `supportingArtifacts`, `recommendedActions`, `visualBlocks` (chart specification). Validation occurs before rendering; invalid payloads log errors and request regeneration.

## Security & Compliance
- Enforce Firestore security rules to restrict blueprint generation to users with `role >= editor` on the engagement.
- Sign Storage URLs with limited TTL; CLI downloads require authentication.
- Sanitize BigQuery exports by removing PII except customer-level metadata allowed under existing agreements.
- Store extension prompts/responses in Storage with KMS-managed encryption keys and TTL set via lifecycle policies.
- Add audit log events (`securityEvents` collection) capturing who generated the blueprint and resulting asset IDs.

## Observability & Reliability
- Instrument Cloud Functions with structured logs (`blueprint_id`, `engagement_id`, `phase`, `latency_ms`).
- Emit metrics to Cloud Monitoring: success rate, average latency, PDF size, BigQuery export failures.
- Implement retry/backoff for Storage uploads and BigQuery inserts; failed exports queue for manual replay.
- Configure alerting for `status='failed'` documents exceeding SLA thresholds.

## Rollout Plan
1. **Phase 0 – Prototype**
   - Implement CLI-only trigger with limited dataset to validate multi-modal prompt quality.
   - Manual QA of PDF layout and artifact bundle contents.
2. **Phase 1 – UI Integration**
   - Release UI entry point behind feature flag `feature.badassBlueprint`.
   - Enable Firestore listeners for status updates; gather DC feedback.
3. **Phase 2 – Analytics + Automation**
   - Activate BigQuery export and dashboard.
   - Introduce automated QA checks (schema validation, linting) before PDF release.
4. **Phase 3 – General Availability**
   - Remove feature flag; document operational playbooks.
   - Provide training materials and update customer onboarding to highlight blueprint capability.

## Dependencies & Open Questions
- **Dependencies**: Multi-modal extension runtime, Firestore/Storage configuration, BigQuery dataset access, Playwright rendering infra, branding templates.
- **Open Questions**:
  - How to incorporate customer-supplied assets (PowerPoint, spreadsheets) into the bundle? (Potential conversion pipeline.)
  - Should blueprint regeneration overwrite or version documents? (Recommend versioned docs to preserve history.)
  - SLA for PDF generation—target < 2 minutes with streaming updates to set expectations.

## Acceptance Criteria
- DC can generate a Badass Blueprint from any POV/TRR record with at least one scenario result and TRR note.
- Generated PDF adheres to Cortex brand guidelines and includes dynamic visuals per payload.
- Storage contains both PDF and artifact bundle with metadata accessible from UI.
- BigQuery table receives export rows within 2 minutes of generation completion.
- Observability dashboards display key metrics (latency, success rate, errors) for blueprint pipeline.

