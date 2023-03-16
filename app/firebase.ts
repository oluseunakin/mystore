import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({
    credential: cert("c://Users/user/Downloads/mystore-378712-0d64a810e4ed.json"),
  });
} 


export const db = getFirestore();
