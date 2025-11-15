'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import SHA256 from 'crypto-js/sha256';
import { v4 as uuidv4 } from 'uuid';

const USER_TOKEN_KEY = 'anonflow-user-token';

export function useAnonUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      // Initiate sign-in, but don't block.
      // The onAuthStateChanged listener in FirebaseProvider will handle the result.
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  useEffect(() => {
    if (user && firestore) {
      const userTokenRef = doc(firestore, 'userTokens', user.uid);
      const tokenData = {
        digitalToken: user.uid,
        // IP address is removed for privacy as requested
        createdAt: new Date().toISOString(),
      };
      // Use non-blocking write. Errors will be caught by the global handler.
      setDocumentNonBlocking(userTokenRef, tokenData, { merge: true });
    }
  }, [user, firestore]);

  return user?.uid || null;
}
