'use client';
import { useCallback } from 'react';
import type { Post } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function usePosts() {
  const firestore = useFirestore();
  const postsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'posts');
  }, [firestore]);

  const { data: posts, isLoading, error } = useCollection<Omit<Post, 'id'>>(postsCollection);

  const addPost = useCallback(
    (newPost: Omit<Post, 'id' | 'createdAt'>) => {
      if (!postsCollection) {
        console.error("Posts collection is not available.");
        return;
      }
      
      const postWithTimestamp = {
        ...newPost,
        createdAt: serverTimestamp(),
      };
      
      // Use non-blocking write. Errors will be caught by the global handler.
      addDocumentNonBlocking(postsCollection, postWithTimestamp);
    },
    [postsCollection]
  );
  
  if (error) {
    console.error("Error fetching posts:", error);
    // You might want to display a user-facing error message here
  }

  const sortedPosts = posts ? [...posts].sort((a, b) => {
    const dateA = (a.createdAt as any)?.toDate?.() || new Date(0);
    const dateB = (b.createdAt as any)?.toDate?.() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  }) : [];

  return { posts: sortedPosts, isLoading, addPost };
}
