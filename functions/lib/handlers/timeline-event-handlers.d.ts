/**
 * Timeline Event Handlers
 *
 * Cloud Functions that normalize domain changes (TRR, Training, KB) into timeline events.
 * These functions trigger on Firestore writes and emit normalized events to user timelines.
 */
import * as functions from 'firebase-functions/v2/firestore';
/**
 * TRR document write handler
 * Triggers: onCreate, onUpdate, onDelete for /trr/{docId}
 */
export declare const trrOnWrite: import("firebase-functions/core").CloudFunction<functions.FirestoreEvent<functions.Change<functions.DocumentSnapshot> | undefined, {
    docId: string;
}>>;
/**
 * Training record write handler
 * Triggers: onCreate, onUpdate, onDelete for /training/{docId}
 */
export declare const trainingOnWrite: import("firebase-functions/core").CloudFunction<functions.FirestoreEvent<functions.Change<functions.DocumentSnapshot> | undefined, {
    docId: string;
}>>;
/**
 * Knowledge Base document write handler
 * Triggers: onCreate, onUpdate, onDelete for /knowledgebase/{docId}
 */
export declare const knowledgebaseOnWrite: import("firebase-functions/core").CloudFunction<functions.FirestoreEvent<functions.Change<functions.DocumentSnapshot> | undefined, {
    docId: string;
}>>;
/**
 * Alternative TRR collection name handler (trrs)
 * Some collections may use plural naming
 */
export declare const trrsOnWrite: import("firebase-functions/core").CloudFunction<functions.FirestoreEvent<functions.Change<functions.DocumentSnapshot> | undefined, {
    docId: string;
}>>;
/**
 * Triggered when a new event is created in user timeline
 * Performs lightweight aggregation and velocity calculations
 */
export declare const onEventCreated: import("firebase-functions/core").CloudFunction<functions.FirestoreEvent<functions.QueryDocumentSnapshot | undefined, {
    userId: string;
    eventId: string;
}>>;
