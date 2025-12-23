'use client';

import { useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/types';

const BACKGROUND_NOTIFICATION_SOUND_URL = 'https://freesound.org/data/previews/131/131660_2398463-lq.mp3';
const FOREGROUND_NOTIFICATION_SOUND_URL = 'https://freesound.org/data/previews/66/66717_634166-lq.mp3';
const NOTIFICATION_ICON_URL = '/logo.svg';

export function useNotifications(
  posts: Post[] | null,
  currentUserId: string | null,
  getUserProfile: (userId: string) => { displayName: string; photoURL?: string | null } | undefined
) {
  // Audio অবজেক্টের জন্য useRef ব্যবহার করা ভালো, কারণ এটি রেন্ডারিং-এর উপর নির্ভরশীল নয়
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const foregroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousPostsRef = useRef<Post[] | null>(posts);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // ১. অডিও ইনিশিয়ালাইজেশন (একবারই হবে)
  useEffect(() => {
    // অডিও এলিমেন্ট তৈরি
    backgroundAudioRef.current = new Audio(BACKGROUND_NOTIFICATION_SOUND_URL);
    foregroundAudioRef.current = new Audio(FOREGROUND_NOTIFICATION_SOUND_URL);
    
    // প্রি-লোড সেট করা
    backgroundAudioRef.current.preload = 'auto';
    foregroundAudioRef.current.preload = 'auto';

    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // ২. পারমিশন রিকোয়েস্ট
  useEffect(() => {
    if (permission === 'default' && 'Notification' in window) {
      Notification.requestPermission().then(setPermission);
    }
  }, [permission]);

  // ৩. মেইন নোটিফিকেশন লজিক
  useEffect(() => {
    if (!posts || !currentUserId) {
      previousPostsRef.current = posts;
      return;
    }

    const previousPosts = previousPostsRef.current || [];
    
    // নতুন পোস্ট ফিল্টার করা
    const newPosts = posts.filter(
      p => !previousPosts.some(prev => prev.id === p.id) && p.userId !== currentUserId
    );

    if (newPosts.length > 0) {
      // শুধু একদম লেটেস্ট মেসেজটি নেওয়া
      const latestPost = newPosts[newPosts.length - 1];
      
      const postDate = (latestPost.createdAt as any)?.toDate ? (latestPost.createdAt as any).toDate() : new Date(latestPost.createdAt as any);
      const now = new Date();
      const timeDiff = now.getTime() - postDate.getTime();

      // ১০ সেকেন্ডের বেশি পুরনো হলে নোটিফিকেশন বাজবে না (স্মার্ট লজিক)
      if (timeDiff < 10000) {
        
        // --- সাউন্ড প্লে করার ফাংশন ---
        const playSound = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
          if (audioRef.current) {
            // সাউন্ড রিসেট করা যাতে পরপর মেসেজ আসলে সমস্যা না হয়
            audioRef.current.currentTime = 0; 
            audioRef.current.play().catch(error => {
              console.warn("Audio play blocked. User interaction needed.", error);
            });
          }
        };

        if (document.hidden) {
          // --- ব্যাকগ্রাউন্ড মোড ---
          playSound(backgroundAudioRef);

          if (permission === 'granted' && 'Notification' in window) {
            const senderProfile = getUserProfile(latestPost.userId);
            const senderName = senderProfile?.displayName || 'New Message';
            
            try {
              const notification = new Notification(senderName, {
                body: latestPost.content,
                icon: senderProfile?.photoURL || NOTIFICATION_ICON_URL,
                tag: 'messenger-notification', // ট্যাগ ব্যবহার করলে আগের নোটিফিকেশন রিপ্লেস হবে
                silent: true, // আমরা অডিও এলিমেন্ট দিয়ে সাউন্ড বাজাচ্ছি, তাই এটি সাইলেন্ট থাকবে
              });
              
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
              
              setTimeout(() => notification.close(), 5000);
            } catch (e) {
              console.error("Notification Error:", e);
            }
          }
        } else {
          // --- ফোরগ্রাউন্ড মোড ---
          playSound(foregroundAudioRef);
        }
      }
    }

    // সবশেষে কারেন্ট পোস্ট আপডেট করা
    previousPostsRef.current = posts;
    
  }, [posts, currentUserId, permission, getUserProfile]);
}
