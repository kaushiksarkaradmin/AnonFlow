
'use client';
import { useCallback, useState, useEffect } from 'react';
import type { Post } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, serverTimestamp, query, orderBy, where, getDocs, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, batchDeleteDocumentsNonBlocking } from '@/firebase/non-blocking-updates';

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

  const { data: posts, isLoading, error } = useCollection<Post>(postsQuery);

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
      
      addDocumentNonBlocking(postsCollection, postWithTimestamp);
    },
    [postsCollection]
  );
  
  const deleteUserPosts = useCallback(async (digitalToken: string) => {
    if (!firestore || !postsCollection) {
      console.error("Firestore or posts collection not available.");
      return;
    }
    const userPostsQuery = query(postsCollection, where('digitalToken', '==', digitalToken));
    
    try {
      const querySnapshot = await getDocs(userPostsQuery);
      const docRefsToDelete = querySnapshot.docs.map(d => doc(firestore, 'posts', d.id));
      
      if (docRefsToDelete.length > 0) {
        batchDeleteDocumentsNonBlocking(firestore, docRefsToDelete);
      }
    } catch(e) {
        console.error("Error querying user posts for deletion: ", e);
    }
  }, [firestore, postsCollection]);

  if (error) {
    console.error("Error fetching posts:", error);
  }

  return { posts: posts || [], isLoading, addPost, deleteUserPosts };
}
