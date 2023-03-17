import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = require('./mystore.json')
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
} 

export const db = getFirestore();
