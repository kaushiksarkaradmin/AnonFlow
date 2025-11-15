'use client';
import { useCallback } from 'react';
import type { Post } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function usePosts() {
  const firestore = useFirestore();
  
  const postsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'posts');
  }, [firestore]);

  const postsQuery = useMemoFirebase(() => {
    if (!postsCollection) return null;
    return query(postsCollection, orderBy('createdAt', 'desc'));
  }, [postsCollection]);

  const { data: posts, isLoading, error } = useCollection<Omit<Post, 'id'>>(postsQuery);

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

  return { posts: posts || [], isLoading, addPost };
}
