'use client';

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useAuth } from '@/firebase';
import { PostCard } from '@/components/post-card';
import { PostForm } from '@/components/post-form';
import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { usePosts } from '@/hooks/use-posts';
import type { UserProfile } from '@/lib/types';
import { useUsers } from '@/hooks/use-users';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useNotifications } from '@/hooks/use-notification-sound';

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useAuthUser();
  
  const { posts, isLoading: isPostsLoading, addPost, deletePost, markAsSeen } = usePosts(!isUserLoading && !!user);
  const { users: userProfiles, isLoading: isUsersLoading } = useUsers(!isUserLoading && !!user);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sentAudio, setSentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This effect should only run on the client
    const audio = new Audio('https://freesound.org/data/previews/415/415764_6142149-lq.mp3');
    audio.preload = 'auto';
    setSentAudio(audio);
  }, []);

  const userProfileMap = useMemo(() => {
    if (!userProfiles) return {};
    return userProfiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, UserProfile>);
  }, [userProfiles]);

  const getUserProfile = useCallback((userId: string) => {
    return userProfileMap[userId];
  }, [userProfileMap]);

  useNotifications(posts, user?.uid || null, getUserProfile);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const handlePostSubmit = (content: string) => {
    if (user) {
      if (sentAudio) {
        sentAudio.play().catch(err => console.error("Error playing sent sound:", err));
      }
      addPost({ content, userId: user.uid });
    }
  };

  const handlePostDelete = (postId: string) => {
    deletePost(postId);
  }

  const handlePostSeen = useCallback((postId: string) => {
    if (user) {
      markAsSeen(postId, user.uid);
    }
  }, [user, markAsSeen]);

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].sort((a, b) => {
      const aDate = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt as any);
      const bDate = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt as any);
      return aDate.getTime() - bDate.getTime();
    });
  }, [posts]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      // On initial load, always scroll to the bottom.
      if (initialLoad && !isPostsLoading && sortedPosts.length > 0) {
        viewport.scrollTop = viewport.scrollHeight;
        setInitialLoad(false); // We've done the initial scroll.
        return;
      }

      // For subsequent updates, only auto-scroll if user is already near the bottom.
      const isScrolledToBottom = viewport.scrollHeight - viewport.clientHeight <= viewport.scrollTop + 100; // a bit of tolerance
      if (!initialLoad && isScrolledToBottom) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [sortedPosts, isPostsLoading, initialLoad]);

  if (isUserLoading || (user && isUsersLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className='flex items-center space-x-2 mb-8'>
            <h1 className="text-3xl font-bold text-primary">Parivarik Chat</h1>
        </div>
        <p className="text-muted-foreground mb-8">Please sign in to continue.</p>
        <Button onClick={handleLogin} size="lg">
          Login with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <SiteHeader />
      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <main className="container mx-auto max-w-2xl flex-grow px-4 py-8">
          <div className="space-y-4">
            {isPostsLoading && (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            )}
            {!isPostsLoading && sortedPosts.map(post => {
              const profile = userProfileMap[post.userId];
              const seenByUsers = (post.seenBy || [])
                .map(userId => userProfileMap[userId])
                .filter((p): p is UserProfile => p !== undefined);

              return (
                <PostCard
                  key={post.id}
                  post={post}
                  displayName={profile?.displayName || 'Anonymous'}
                  photoURL={profile?.photoURL}
                  currentUserId={user.uid}
                  onDelete={handlePostDelete}
                  onSeen={handlePostSeen}
                  seenByUsers={seenByUsers}
                />
              )
            })}
          </div>
        </main>
      </ScrollArea>
       <footer className="p-4 bg-background border-t">
          <div className="container mx-auto max-w-2xl">
            <PostForm onPostSuccess={handlePostSubmit} />
          </div>
        </footer>
    </div>
  );
}
