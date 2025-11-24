'use client';
import { useCallback, useState, useEffect } from 'react';
import type { Post, ReactionType } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function usePosts() {
  const firestore = useFirestore();
  const [localPosts, setLocalPosts] = useState<Post[] | null>(null);
  
  const postsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'posts');
  }, [firestore]);

  const postsQuery = useMemoFirebase(() => {
    if (!postsCollection) return null;
    return query(postsCollection, orderBy('createdAt', 'desc'));
  }, [postsCollection]);

  const { data: serverPosts, isLoading, error } = useCollection<Post>(postsQuery);

  useEffect(() => {
    if (serverPosts) {
      setLocalPosts(serverPosts);
    }
  }, [serverPosts]);

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
      
      addDocumentNonBlocking(postsCollection, postWithTimestamp);
    },
    [postsCollection]
  );
  
  const addReaction = useCallback(
    (postId: string, digitalToken: string, reaction: ReactionType) => {
      if (!firestore) return;

      const currentPost = (localPosts || serverPosts)?.find(p => p.id === postId);
      if (!currentPost) return;

      const userHasReactedWithColor = currentPost.reactions?.[reaction]?.includes(digitalToken);

      // Optimistic UI update
      setLocalPosts(prevPosts => {
        if (!prevPosts) return null;
        return prevPosts.map(p => {
          if (p.id === postId) {
            const newReactions = { ...(p.reactions || { red: [], yellow: [], green: [] }) };
            
            // Remove user from all reaction arrays first
            (Object.keys(newReactions) as ReactionType[]).forEach(key => {
              newReactions[key] = (newReactions[key] || []).filter(token => token !== digitalToken);
            });

            // If the user wasn't already reacting with this color, add them.
            if (!userHasReactedWithColor) {
               newReactions[reaction] = [...(newReactions[reaction] || []), digitalToken];
            }
            
            return { ...p, reactions: newReactions };
          }
          return p;
        });
      });

      // Update firestore in the background
      const postRef = doc(firestore, 'posts', postId);
      const batch = writeBatch(firestore);
      const allReactionTypes: ReactionType[] = ['red', 'yellow', 'green'];

      // Always remove the user from all reactions first to handle switching.
      allReactionTypes.forEach(type => {
        batch.update(postRef, { [`reactions.${type}`]: arrayRemove(digitalToken) });
      });

      // If it wasn't a toggle-off, add the new reaction.
      if (!userHasReactedWithColor) {
         batch.update(postRef, { [`reactions.${reaction}`]: arrayUnion(digitalToken) });
      }
      
      batch.commit().catch(err => {
        // Revert optimistic update on error by resetting to server state
        setLocalPosts(serverPosts);
        
        // Create and emit a detailed error for debugging
        const contextualError = new FirestorePermissionError({
          path: postRef.path,
          operation: 'update',
          requestResourceData: { reactions: '...' } // Don't send the full reaction data for brevity
        });
        errorEmitter.emit('permission-error', contextualError);
      });

    }, [firestore, serverPosts, localPosts]
  );
  
  if (error) {
    console.error("Error fetching posts:", error);
  }

  return { posts: localPosts || [], isLoading, addPost, addReaction };
}
