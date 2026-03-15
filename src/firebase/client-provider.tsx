
'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // تهيئة Firebase على جانب العميل فقط لتجنب أخطاء السيرفر
  const firebase = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      firebaseApp={firebase.firebaseApp} 
      firestore={firebase.firestore} 
      auth={firebase.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
