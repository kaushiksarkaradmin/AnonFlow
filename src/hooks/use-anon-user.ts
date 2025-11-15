'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateRandomName } from '@/lib/random-names';
import type { UserToken } from '@/lib/types';

const USER_DISPLAY_NAME_KEY = 'anon-user-display-name';

export function useAnonUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [displayName, setDisplayName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(USER_DISPLAY_NAME_KEY);
    }
    return null;
  });

  const userTokenRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'userTokens', user.uid) : null),
    [firestore, user]
  );
  
  const { data: userTokenDoc } = useDoc<UserToken>(userTokenRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  useEffect(() => {
    if (user && firestore && userTokenRef) {
      if (userTokenDoc === undefined) {
        // Still loading from Firestore, do nothing and rely on local storage version
        return;
      }

      if (userTokenDoc === null) {
        // Document doesn't exist in Firestore, create it.
        const newName = displayName || generateRandomName();
        const tokenData = {
          digitalToken: user.uid,
          displayName: newName,
          createdAt: serverTimestamp(),
        };
        setDocumentNonBlocking(userTokenRef, tokenData, { merge: false });
        setDisplayName(newName);
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_DISPLAY_NAME_KEY, newName);
        }
      } else {
        // Document exists, sync state with Firestore and local storage.
        setDisplayName(userTokenDoc.displayName);
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_DISPLAY_NAME_KEY, userTokenDoc.displayName);
        }
      }
    }
  }, [user, firestore, userTokenRef, userTokenDoc, displayName]);

  return { digitalToken: user?.uid || null, displayName };
}
