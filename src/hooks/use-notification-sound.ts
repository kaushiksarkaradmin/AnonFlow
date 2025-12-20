'use client';

import { useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/types';

// URL for a public domain notification sound
const NOTIFICATION_SOUND_URL = 'https://freesound.org/data/previews/415/415763_6142149-lq.mp3';

// Icon for the notification
const NOTIFICATION_ICON_URL = '/logo.svg';

export function useNotifications(
  posts: Post[],
  currentUserId: string | null,
  getUserProfile: (userId: string) => { displayName: string; photoURL?: string | null } | undefined
) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const previousPostCount = useRef(posts.length);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // This effect runs only on the client side to safely create the Audio object
    // and check for notification permissions.
    const audioInstance = new Audio(NOTIFICATION_SOUND_URL);
    audioInstance.preload = 'auto';
    setAudio(audioInstance);

    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Effect to request permission when the component mounts if it's default
  useEffect(() => {
    if (permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, [permission]);


  useEffect(() => {
    if (!audio || !posts || posts.length <= previousPostCount.current) {
      previousPostCount.current = posts.length;
      return;
    }

    const latestPost = posts[posts.length - 1];

    if (latestPost && latestPost.userId !== currentUserId) {
      const postDate = (latestPost.createdAt as any)?.toDate ? (latestPost.createdAt as any).toDate() : new Date(latestPost.createdAt as any);
      const now = new Date();
      const timeDiff = now.getTime() - postDate.getTime();

      // Only notify for recent posts (e.g., within the last 10 seconds)
      if (timeDiff < 10000) {
        // Play sound
        audio.play().catch(error => {
          console.error("Audio play failed:", error);
        });

        // Show browser notification
        if (permission === 'granted') {
          const senderProfile = getUserProfile(latestPost.userId);
          const senderName = senderProfile?.displayName || 'New Message';
          
          const notification = new Notification(senderName, {
            body: latestPost.content,
            icon: senderProfile?.photoURL || NOTIFICATION_ICON_URL,
          });

          // Optional: close notification after a few seconds
          setTimeout(() => notification.close(), 5000);
        }
      }
    }

    previousPostCount.current = posts.length;
  }, [posts, audio, currentUserId, permission, getUserProfile]);
}
