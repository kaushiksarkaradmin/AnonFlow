'use client';

import { useEffect } from 'react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { UserProfile } from '@/lib/types';

export function useAuthUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: userProfileDoc } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (user && firestore && userProfileRef) {
      // When user is authenticated, ensure their profile exists in Firestore.
      if (userProfileDoc === undefined) {
        // Still loading from Firestore, do nothing.
        return;
      }

      if (userProfileDoc === null) {
        // Document doesn't exist in Firestore, create it.
        const profileData: Omit<UserProfile, 'id'> = {
          displayName: user.displayName || 'Anonymous User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
        };
        setDocumentNonBlocking(userProfileRef, profileData, { merge: false });
      } else {
        // Document exists, check for updates.
        const hasChanges = 
            userProfileDoc.displayName !== user.displayName ||
            userProfileDoc.email !== user.email ||
            userProfileDoc.photoURL !== user.photoURL;
        
        if (hasChanges) {
             const updatedProfileData = {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
             };
             setDocumentNonBlocking(userProfileRef, updatedProfileData, { merge: true });
        }
      }
    }
  }, [user, firestore, userProfileRef, userProfileDoc]);

  return { user, isUserLoading };
}
