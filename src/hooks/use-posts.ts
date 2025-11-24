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
        reactions: { likes: [], dislikes: [] },
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

        const userHasReactedWith = (r: ReactionType) => currentPost.reactions?.[r]?.includes(digitalToken);
        const isTogglingOff = userHasReactedWith(reaction);
        const oppositeReaction: ReactionType = reaction === 'likes' ? 'dislikes' : 'likes';
        
        // Optimistic UI update
        setLocalPosts(prevPosts => {
            if (!prevPosts) return null;
            return prevPosts.map(p => {
                if (p.id === postId) {
                    const newReactions = { ...(p.reactions || { likes: [], dislikes: [] }) };
                    
                    // If switching reaction, remove from opposite
                    if (!isTogglingOff && userHasReactedWith(oppositeReaction)) {
                        newReactions[oppositeReaction] = (newReactions[oppositeReaction] || []).filter(token => token !== digitalToken);
                    }

                    // Toggle the selected reaction
                    if (isTogglingOff) {
                         newReactions[reaction] = (newReactions[reaction] || []).filter(token => token !== digitalToken);
                    } else {
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
        
        batch.update(postRef, { [`reactions.${reaction}`]: isTogglingOff ? arrayRemove(digitalToken) : arrayUnion(digitalToken) });
        
        // If user is not toggling off and has reacted with the opposite, remove opposite reaction
        if (!isTogglingOff && userHasReactedWith(oppositeReaction)) {
            batch.update(postRef, { [`reactions.${oppositeReaction}`]: arrayRemove(digitalToken) });
        }
        
        batch.commit().catch(err => {
            // Revert optimistic update on error by resetting to server state
            setLocalPosts(serverPosts);
            
            const contextualError = new FirestorePermissionError({
                path: postRef.path,
                operation: 'update',
                requestResourceData: { reactions: '...' }
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