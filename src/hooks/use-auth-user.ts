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
  
  const { data: userProfileDoc, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (isUserLoading || !user || !firestore || !userProfileRef) {
      return;
    }

    // This effect runs when the user is authenticated and their profile might need to be created or updated.
    
    // We check if the profile is still loading or has been loaded.
    if (isProfileLoading) return;

    const profileDataFromProvider = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };

    if (userProfileDoc === null) {
      // Document doesn't exist in Firestore, create it.
      const newProfile: Omit<UserProfile, 'id'> = {
        ...profileDataFromProvider,
        displayName: profileDataFromProvider.displayName || 'New User',
        email: profileDataFromProvider.email || '',
        photoURL: profileDataFromProvider.photoURL || '',
        createdAt: serverTimestamp(),
      };
      setDocumentNonBlocking(userProfileRef, newProfile, { merge: false });
    } else {
      // Document exists, check for updates from Google profile.
      const hasChanges =
        userProfileDoc.displayName !== profileDataFromProvider.displayName ||
        userProfileDoc.email !== profileDataFromProvider.email ||
        userProfileDoc.photoURL !== profileDataFromProvider.photoURL;

      if (hasChanges) {
        setDocumentNonBlocking(userProfileRef, profileDataFromProvider, { merge: true });
      }
    }
  }, [user, isUserLoading, firestore, userProfileRef, userProfileDoc, isProfileLoading]);

  return { user, isUserLoading: isUserLoading || isProfileLoading, userProfile: userProfileDoc };
}
