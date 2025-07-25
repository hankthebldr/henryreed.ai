import * as functions from "firebase-functions";

// Placeholder Cloud Function. Replace with real implementation when ready.
export const helloWorld = functions.https.onRequest((req, res) => {
  res.status(200).send("Hello from Firebase Functions placeholder!");
});

