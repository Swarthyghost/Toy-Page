import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'toy-page';
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

// Normalize private key formatting to support multiline keys in env values
const privateKey = rawPrivateKey 
  ? rawPrivateKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1')
  : undefined;

let app;
if (getApps().length === 0) {
  try {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("[FirebaseAdmin] Successfully initialized Firebase Admin SDK.");
  } catch (err) {
    console.error("[FirebaseAdmin] Error initializing Firebase Admin SDK:", err);
  }
} else {
  app = getApp();
}

export const dbAdmin = getFirestore(app);
