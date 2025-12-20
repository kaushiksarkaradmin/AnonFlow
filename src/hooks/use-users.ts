'use client';
import type { UserProfile } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection } from 'firebase/firestore';

export function useUsers(enabled: boolean = true) {
  const firestore = useFirestore();
  
  const usersCollection = useMemoFirebase(() => {
    // Only return a query if the hook is enabled
    if (!firestore || !enabled) return null;
    return collection(firestore, 'users');
  }, [firestore, enabled]);


  const { data: users, isLoading, error } = useCollection<UserProfile>(usersCollection);
  
  if (error) {
    // This error is expected if a non-whitelisted user tries to sign in.
    // We can silently log it or handle it gracefully.
    console.log("Could not fetch users, possibly due to permissions:", error.message);
  }

  return { users: users || [], isLoading: enabled ? isLoading : false };
}
