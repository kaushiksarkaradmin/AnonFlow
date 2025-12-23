'use client';
import { useCallback } from 'react';
import type { Post } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, serverTimestamp, query, orderBy, doc, arrayUnion } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function usePosts(enabled: boolean = true) {
  const firestore = useFirestore();
  
  const postsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'posts');
  }, [firestore]);

  const postsQuery = useMemoFirebase(() => {
    // Only return a query if the hook is enabled
    if (!postsCollection || !enabled) return null;
    return query(postsCollection, orderBy('createdAt', 'asc'));
  }, [postsCollection, enabled]);

  const { data: posts, isLoading, error } = useCollection<Post>(postsQuery);

  const addPost = useCallback(
    (newPost: Omit<Post, 'id' | 'createdAt' | 'seenBy'>) => {
      if (!postsCollection) {
        console.error("Posts collection is not available.");
        return;
      }
      
      const postWithTimestamp = {
        ...newPost,
        createdAt: serverTimestamp(),
        seenBy: [newPost.userId]
      };
      
      addDocumentNonBlocking(postsCollection, postWithTimestamp);
    },
    [postsCollection]
  );

  const deletePost = useCallback(
    (postId: string) => {
      if (!firestore) {
        console.error("Firestore is not available.");
        return;
      }
      const postRef = doc(firestore, 'posts', postId);
      deleteDocumentNonBlocking(postRef);
    },
    [firestore]
  );

  const markAsSeen = useCallback(
    (postId: string, userId: string) => {
      if (!firestore) return;
      const postRef = doc(firestore, 'posts', postId);
      updateDocumentNonBlocking(postRef, {
        seenBy: arrayUnion(userId)
      });
    },
    [firestore]
  );
  
  if (error) {
    // This error might be expected if the user isn't logged in yet, so we don't log it aggressively.
    // The UI will handle the loading state.
  }

  return { posts: posts || [], isLoading: enabled ? isLoading : false, addPost, deletePost, markAsSeen };
}
