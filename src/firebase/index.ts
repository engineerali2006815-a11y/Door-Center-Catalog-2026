'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // تسجيل دخول مجهول في الخلفية لضمان عمل Security Rules
  if (typeof window !== 'undefined') {
    signInAnonymously(auth).catch(err => {
      // نتجاهل خطأ API Key في هذه المرحلة إذا كان المتصفح لم يقم بتحديث الإعدادات بعد
      console.warn("Auth initialization warning:", err.message);
    });
  }

  return { firebaseApp: app, firestore: db, auth };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
