'use client';

import { useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/types';

// URL for a public domain notification sound for background notifications
const BACKGROUND_NOTIFICATION_SOUND_URL = 'https://freesound.org/data/previews/341/341695_5737253-lq.mp3';
// URL for a quick "pop" sound for foreground notifications
const FOREGROUND_NOTIFICATION_SOUND_URL = 'https://freesound.org/data/previews/66/66717_634166-lq.mp3';

// Icon for the notification
const NOTIFICATION_ICON_URL = '/logo.svg';

export function useNotifications(
  posts: Post[] | null,
  currentUserId: string | null,
  getUserProfile: (userId: string) => { displayName: string; photoURL?: string | null } | undefined
) {
  const [backgroundAudio, setBackgroundAudio] = useState<HTMLAudioElement | null>(null);
  const [foregroundAudio, setForegroundAudio] = useState<HTMLAudioElement | null>(null);
  const previousPostsRef = useRef<Post[] | null>(posts);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // This effect runs only on the client side to safely create the Audio objects
    // and check for notification permissions.
    const bgAudio = new Audio(BACKGROUND_NOTIFICATION_SOUND_URL);
    bgAudio.preload = 'auto';
    setBackgroundAudio(bgAudio);

    const fgAudio = new Audio(FOREGROUND_NOTIFICATION_SOUND_URL);
    fgAudio.preload = 'auto';
    setForegroundAudio(fgAudio);

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
    if (!posts || !currentUserId) {
        previousPostsRef.current = posts;
        return;
    }

    const previousPosts = previousPostsRef.current || [];
    const newPosts = posts.filter(
        p => !previousPosts.some(prev => prev.id === p.id) && p.userId !== currentUserId
    );

    if (newPosts.length > 0) {
        const latestPost = newPosts[newPosts.length - 1];
        
        const postDate = (latestPost.createdAt as any)?.toDate ? (latestPost.createdAt as any).toDate() : new Date(latestPost.createdAt as any);
        const now = new Date();
        const timeDiff = now.getTime() - postDate.getTime();

        // Only notify for recent posts (e.g., within the last 10 seconds) to avoid old notifications on load
        if (timeDiff < 10000) {
            if (document.hidden) {
                // App is in the background: play sound and show system notification
                if (backgroundAudio) {
                    backgroundAudio.play().catch(error => {
                        console.error("Background audio play was prevented:", error);
                    });
                }

                if (permission === 'granted' && 'Notification' in window) {
                    const senderProfile = getUserProfile(latestPost.userId);
                    const senderName = senderProfile?.displayName || 'New Message';
                    
                    try {
                        const notification = new Notification(senderName, {
                            body: latestPost.content,
                            icon: senderProfile?.photoURL || NOTIFICATION_ICON_URL,
                            tag: 'parivarik-chat-message', // Use a tag to prevent multiple notifications for the same event
                            silent: true, // The sound is handled by the Audio element
                        });
                        // Automatically close the notification after a few seconds
                        setTimeout(() => notification.close(), 5000);
                    } catch (e) {
                        console.error("Error creating notification:", e);
                    }
                }
            } else {
                // App is in the foreground: just play the "pop" sound
                if (foregroundAudio) {
                    foregroundAudio.play().catch(error => {
                        console.error("Foreground audio play was prevented:", error);
                    });
                }
            }
        }
    }

    previousPostsRef.current = posts;
  }, [posts, backgroundAudio, foregroundAudio, currentUserId, permission, getUserProfile]);
}
