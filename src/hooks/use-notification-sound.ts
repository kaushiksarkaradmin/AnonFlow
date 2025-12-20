'use client';

import { useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/types';

// URL for a public domain notification sound
const NOTIFICATION_SOUND_URL = 'https://cdn.freesound.org/previews/253/253887_3132313-lq.mp3';

export function useNotificationSound(posts: Post[], currentUserId: string | null) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  // Keep track of the number of posts to detect when a new one is added.
  const previousPostCount = useRef(posts.length);

  useEffect(() => {
    // This effect runs only on the client side to safely create the Audio object.
    const audioInstance = new Audio(NOTIFICATION_SOUND_URL);
    audioInstance.preload = 'auto';
    setAudio(audioInstance);
  }, []);

  useEffect(() => {
    if (!audio || posts.length <= previousPostCount.current) {
        // No new posts, so do nothing.
      previousPostCount.current = posts.length;
      return;
    }

    // Get the latest post
    const latestPost = posts[posts.length - 1];

    // Play sound only if the latest post is not from the current user
    // and is a recent message (e.g., within the last 10 seconds).
    if (latestPost && latestPost.userId !== currentUserId) {
        const postDate = (latestPost.createdAt as any)?.toDate ? (latestPost.createdAt as any).toDate() : new Date(latestPost.createdAt as any);
        const now = new Date();
        const timeDiff = now.getTime() - postDate.getTime();
        
        if (timeDiff < 10000) { // Only play for posts in the last 10 seconds
            audio.play().catch(error => {
                console.error("Audio play failed:", error);
            });
        }
    }

    // Update the post count for the next render.
    previousPostCount.current = posts.length;
  }, [posts, audio, currentUserId]);
}
