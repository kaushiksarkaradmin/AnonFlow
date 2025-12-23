'use client';

import { useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/types';

// URL for a public domain notification sound from freesound.org
const NOTIFICATION_SOUND_URL = 'https://freesound.org/data/previews/415/415764_6142149-lq.mp3';

// Icon for the notification
const NOTIFICATION_ICON_URL = '/logo.svg';

export function useNotifications(
  posts: Post[] | null, // Can be null initially
  currentUserId: string | null,
  getUserProfile: (userId: string) => { displayName: string; photoURL?: string | null } | undefined
) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const previousPostCount = useRef(posts?.length || 0);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // This effect runs only on the client side to safely create the Audio object
    // and check for notification permissions.
    const notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
    notificationAudio.preload = 'auto';
    setAudio(notificationAudio);

    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Effect to request permission when the component mounts if it's default
  useEffect(() => {
    if (permission === 'default' && 'Notification' in window) {
      Notification.requestPermission().then(setPermission);
    }
  }, [permission]);


  useEffect(() => {
    // Ensure posts is not null and has grown
    if (!posts || posts.length <= previousPostCount.current) {
      previousPostCount.current = posts?.length || 0;
      return;
    }

    const latestPost = posts[posts.length - 1];

    if (latestPost && latestPost.userId !== currentUserId) {
        const postDate = (latestPost.createdAt as any)?.toDate ? (latestPost.createdAt as any).toDate() : new Date(latestPost.createdAt as any);
        const now = new Date();
        const timeDiff = now.getTime() - postDate.getTime();

        // Only notify for recent posts (e.g., within the last 10 seconds)
        if (timeDiff < 10000) {
            // Play sound regardless of foreground/background
            if (audio) {
                audio.play().catch(error => {
                // This can happen if the user hasn't interacted with the page yet.
                // It's a browser policy to prevent autoplaying audio.
                console.error("Audio play was prevented:", error);
                });
            }

            // If app is in the background, also show system notification
            if (document.hidden && permission === 'granted' && 'Notification' in window) {
                const senderProfile = getUserProfile(latestPost.userId);
                const senderName = senderProfile?.displayName || 'New Message';
                
                try {
                    const notification = new Notification(senderName, {
                    body: latestPost.content,
                    icon: senderProfile?.photoURL || NOTIFICATION_ICON_URL,
                    tag: 'parivarik-chat-message', // Use a tag to prevent multiple notifications
                    silent: true, // The sound is handled by the Audio element
                    });
                    // Close notification after 5 seconds
                    setTimeout(() => notification.close(), 5000);
                } catch (e) {
                    console.error("Error creating notification:", e);
                }
            }
        }
    }

    previousPostCount.current = posts.length;
  }, [posts, audio, currentUserId, permission, getUserProfile]);
}
