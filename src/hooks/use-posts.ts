'use client';
import { useCallback } from 'react';
import type { Post } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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
    (newPost: Omit<Post, 'id' | 'createdAt' | 'reactions'>) => {
      if (!postsCollection) {
        console.error("Posts collection is not available.");
        return;
      }
      
      const postWithTimestamp = {
        ...newPost,
        createdAt: serverTimestamp(),
        reactions: { red: [], yellow: [], green: [] },
      };
      
      // Use non-blocking write. Errors will be caught by the global handler.
      addDocumentNonBlocking(postsCollection, postWithTimestamp);
    },
    [postsCollection]
  );
  
  const addReaction = useCallback(
    (postId: string, digitalToken: string, reaction: 'red' | 'yellow' | 'green') => {
      if (!firestore) return;

      const postRef = doc(firestore, 'posts', postId);
      const currentPost = posts?.find(p => p.id === postId);
      if (!currentPost) return;

      const batch = writeBatch(firestore);

      const otherReactions = (['red', 'yellow', 'green'] as const).filter(r => r !== reaction);
      
      let alreadyReacted = false;
      // if user already reacted with the same color, remove the reaction
      if (currentPost.reactions?.[reaction]?.includes(digitalToken)) {
        alreadyReacted = true;
        batch.update(postRef, {
          [`reactions.${reaction}`]: arrayRemove(digitalToken)
        });
      } else {
        // Add the new reaction
         batch.update(postRef, {
          [`reactions.${reaction}`]: arrayUnion(digitalToken)
        });
      }

      // Remove user from other reaction colors
      otherReactions.forEach(color => {
        if (currentPost.reactions?.[color]?.includes(digitalToken)) {
           batch.update(postRef, {
            [`reactions.${color}`]: arrayRemove(digitalToken)
          });
        }
      });
      
      batch.commit().catch(err => console.error("Failed to update reaction", err));

    }, [firestore, posts]
  );
  
  if (error) {
    console.error("Error fetching posts:", error);
    // You might want to display a user-facing error message here
  }

  return { posts: posts || [], isLoading, addPost, addReaction };
}
