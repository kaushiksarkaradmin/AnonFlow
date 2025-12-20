'use client';
import type { UserProfile } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection } from 'firebase/firestore';

export function useUsers() {
  const firestore = useFirestore();
  
  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);


  const { data: users, isLoading, error } = useCollection<UserProfile>(usersCollection);
  
  if (error) {
    // This error is expected if a non-whitelisted user tries to sign in.
    // We can silently log it or handle it gracefully.
    console.log("Could not fetch users, possibly due to permissions:", error.message);
  }

  return { users: users || [], isLoading };
}
