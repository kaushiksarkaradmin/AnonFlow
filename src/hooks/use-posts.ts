'use client';
import { useCallback, useState, useEffect } from 'react';
import type { Post, ReactionType } from '@/lib/types';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
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

      // Optimistic UI update
      setLocalPosts(prevPosts => {
        if (!prevPosts) return null;
        return prevPosts.map(p => {
          if (p.id === postId) {
            const newReactions = { ...(p.reactions || { red: [], yellow: [], green: [] }) };
            const otherReactions: ReactionType[] = ['red', 'yellow', 'green'].filter(r => r !== reaction);
            const userHasReacted = newReactions[reaction]?.includes(digitalToken);

            // Toggle reaction
            if (userHasReacted) {
              newReactions[reaction] = newReactions[reaction]?.filter(token => token !== digitalToken);
            } else {
              newReactions[reaction] = [...(newReactions[reaction] || []), digitalToken];
            }

            // Remove from other reactions
            otherReactions.forEach(r => {
              newReactions[r] = newReactions[r]?.filter(token => token !== digitalToken);
            });
            
            return { ...p, reactions: newReactions };
          }
          return p;
        });
      });

      // Update firestore in the background
      const postRef = doc(firestore, 'posts', postId);
      const currentPost = serverPosts?.find(p => p.id === postId);
      if (!currentPost) return;

      const batch = writeBatch(firestore);

      const otherReactions = (['red', 'yellow', 'green'] as const).filter(r => r !== reaction);
      
      if (currentPost.reactions?.[reaction]?.includes(digitalToken)) {
        batch.update(postRef, {
          [`reactions.${reaction}`]: arrayRemove(digitalToken)
        });
      } else {
        batch.update(postRef, {
          [`reactions.${reaction}`]: arrayUnion(digitalToken)
        });
        otherReactions.forEach(color => {
          if (currentPost.reactions?.[color]?.includes(digitalToken)) {
             batch.update(postRef, {
              [`reactions.${color}`]: arrayRemove(digitalToken)
            });
          }
        });
      }
      
      batch.commit().catch(err => {
        console.error("Failed to update reaction", err);
        // Revert optimistic update on error
        setLocalPosts(serverPosts);
      });

    }, [firestore, serverPosts]
  );
  
  if (error) {
    console.error("Error fetching posts:", error);
  }

  return { posts: localPosts || [], isLoading, addPost, addReaction };
}
