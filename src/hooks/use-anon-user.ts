'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateRandomName } from '@/lib/random-names';
import type { UserToken } from '@/lib/types';


export function useAnonUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [displayName, setDisplayName] = useState<string | null>(null);

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
        // Still loading
        return;
      }

      if (userTokenDoc === null) {
        // Document doesn't exist, create it with a new name
        const newName = generateRandomName();
        const tokenData = {
          digitalToken: user.uid,
          displayName: newName,
          createdAt: serverTimestamp(),
        };
        setDocumentNonBlocking(userTokenRef, tokenData, { merge: false });
        setDisplayName(newName);
      } else {
        // Document exists, use its name
        setDisplayName(userTokenDoc.displayName);
      }
    }
  }, [user, firestore, userTokenRef, userTokenDoc]);

  return { digitalToken: user?.uid || null, displayName };
}
