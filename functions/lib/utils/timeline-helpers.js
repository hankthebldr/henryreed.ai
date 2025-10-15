"use strict";
/**
 * Timeline Event Helper Utilities
 *
 * Pure functions for creating and manipulating timeline events.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEventId = generateEventId;
exports.computeDelta = computeDelta;
exports.determineAction = determineAction;
exports.extractObjectName = extractObjectName;
exports.createTimelineEvent = createTimelineEvent;
exports.validateEvent = validateEvent;
exports.prepareEventForFirestore = prepareEventForFirestore;
exports.getSourceFromCollection = getSourceFromCollection;
exports.inferSeverity = inferSeverity;
exports.formatEventTimestamp = formatEventTimestamp;
exports.getActionLabel = getActionLabel;
exports.getSourceLabel = getSourceLabel;
exports.extractOwnerId = extractOwnerId;
exports.shouldCreateEvent = shouldCreateEvent;
const firestore_1 = require("firebase-admin/firestore");
/**
 * Generates a unique event ID
 */
function generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Computes the delta (differences) between two document snapshots
 */
function computeDelta(before, after) {
    const changed = new Set();
    const diff = {};
    if (!before && after) {
        // Document created - all fields are new
        Object.keys(after).forEach((key) => {
            if (!key.startsWith('_') && key !== 'createdAt' && key !== 'updatedAt') {
                changed.add(key);
            }
        });
    }
    else if (before && after) {
        // Document updated - find changed fields
        const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
        allKeys.forEach((key) => {
            if (key.startsWith('_') || key === 'createdAt' || key === 'updatedAt') {
                return;
            }
            const beforeVal = JSON.stringify(before[key]);
            const afterVal = JSON.stringify(after[key]);
            if (beforeVal !== afterVal) {
                changed.add(key);
                diff[key] = [before[key], after[key]];
            }
        });
    }
    else if (before && !after) {
        // Document deleted - all fields removed
        Object.keys(before).forEach((key) => {
            if (!key.startsWith('_')) {
                changed.add(key);
            }
        });
    }
    return {
        fields: Array.from(changed),
        diff: Object.keys(diff).length > 0 ? diff : undefined,
    };
}
/**
 * Determines the appropriate event action based on document state changes
 */
function determineAction(before, after) {
    if (!before && after) {
        return 'created';
    }
    if (before && !after) {
        return 'deleted';
    }
    if (before && after) {
        // Check for status changes
        if (before.status !== after.status) {
            return 'status_changed';
        }
        // Check for completion
        if (!before.completedAt &&
            after.completedAt &&
            (after.status === 'completed' || after.status === 'done')) {
            return 'completed';
        }
        // Check for publishing
        if ((!before.publishedAt && after.publishedAt) ||
            (before.status !== 'published' && after.status === 'published')) {
            return 'published';
        }
        return 'updated';
    }
    return 'updated';
}
/**
 * Extracts the object name from document data
 */
function extractObjectName(data, objectId) {
    if (!data)
        return objectId;
    return data.title || data.name || data.topic || data.description || objectId;
}
/**
 * Creates a normalized timeline event from domain change parameters
 */
function createTimelineEvent(params) {
    const { userId, source, action: providedAction, objectId, objectType, objectName, before, after, context = {}, correlationId, severity = 'info', ttlDays = 365, } = params;
    const action = providedAction || determineAction(before, after);
    const delta = computeDelta(before, after);
    return {
        eventId: generateEventId(),
        userId,
        actor: {
            uid: userId,
            // Actor details can be enriched later if needed
        },
        ts: firestore_1.Timestamp.now(),
        source,
        action,
        object: {
            type: objectType,
            id: objectId,
            name: objectName,
            version: after?.version || before?.version || 1,
            status_before: before?.status || null,
            status_after: after?.status || null,
        },
        delta,
        context: {
            povId: context.povId || null,
            tvStage: context.tvStage || null,
            scenarioId: context.scenarioId || null,
            labels: context.labels || [],
        },
        correlationId: correlationId || null,
        severity,
        ttlDays,
    };
}
/**
 * Validates that a timeline event has all required fields
 */
function validateEvent(event) {
    return !!(event.eventId &&
        event.userId &&
        event.actor &&
        event.ts &&
        event.source &&
        event.action &&
        event.object &&
        event.delta &&
        event.context !== undefined &&
        event.severity &&
        typeof event.ttlDays === 'number');
}
/**
 * Converts a Firestore server timestamp placeholder to the event object
 */
function prepareEventForFirestore(event) {
    return {
        ...event,
        ts: firestore_1.FieldValue.serverTimestamp(),
    };
}
/**
 * Gets the source from a collection name
 */
function getSourceFromCollection(collectionName) {
    switch (collectionName) {
        case 'trr':
        case 'trrs':
            return 'trr';
        case 'training':
            return 'training';
        case 'knowledgebase':
        case 'knowledgeBase':
            return 'knowledgebase';
        case 'ui':
            return 'ui';
        case 'system':
            return 'system';
        default:
            return 'system';
    }
}
/**
 * Determines event severity based on action and source
 */
function inferSeverity(action, source) {
    if (action === 'deleted')
        return 'warn';
    if (action === 'status_changed' && source === 'trr')
        return 'notice';
    if (action === 'completed')
        return 'notice';
    return 'info';
}
/**
 * Formats an event timestamp for display
 */
function formatEventTimestamp(ts) {
    const date = ts.toDate();
    return date.toISOString();
}
/**
 * Gets a human-readable label for an event action
 */
function getActionLabel(action) {
    const labels = {
        created: 'Created',
        updated: 'Updated',
        deleted: 'Deleted',
        status_changed: 'Status Changed',
        viewed: 'Viewed',
        note_added: 'Note Added',
        linked: 'Linked',
        completed: 'Completed',
        published: 'Published',
        archived: 'Archived',
    };
    return labels[action] || action;
}
/**
 * Gets a human-readable label for an event source
 */
function getSourceLabel(source) {
    const labels = {
        trr: 'TRR',
        training: 'Training',
        knowledgebase: 'Knowledge Base',
        ui: 'UI',
        system: 'System',
    };
    return labels[source] || source;
}
/**
 * Extracts owner/user ID from document data
 */
function extractOwnerId(data) {
    if (!data)
        return null;
    return data.ownerUid || data.ownerId || data.userId || data.createdBy || null;
}
/**
 * Checks if an event should be created (filters out no-op updates)
 */
function shouldCreateEvent(before, after) {
    // Always create events for create/delete
    if (!before || !after)
        return true;
    // Compute delta and check if anything meaningful changed
    const delta = computeDelta(before, after);
    // Skip if only updatedAt or version changed
    const meaningfulFields = delta.fields.filter((f) => f !== 'updatedAt' && f !== 'version' && f !== '_lastModified');
    return meaningfulFields.length > 0;
}
//# sourceMappingURL=timeline-helpers.js.map