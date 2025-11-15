'use client';

import { SiteHeader } from '@/components/site-header';
import { PostForm } from '@/components/post-form';
import { PostCard } from '@/components/post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePosts } from '@/hooks/use-posts';
import { useAnonUser } from '@/hooks/use-anon-user';
import type { Post } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateAvatarColor } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Fisher-Yates shuffle algorithm
function shufflePosts(array: Post[]): Post[] {
  if (!array) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function Home() {
  const { posts, addPost, isLoading } = usePosts();
  const digitalToken = useAnonUser();
  
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const [newest, ...rest] = posts;
      const shuffledRest = shufflePosts(rest);
      setDisplayedPosts([newest, ...shuffledRest]);
    } else {
      setDisplayedPosts([]);
    }
  }, [posts]);

  const activeUsers = useMemo(() => {
    if (!posts) return [];
    const userTokens = new Set(posts.map(p => p.digitalToken));
    return Array.from(userTokens);
  }, [posts]);

  const handlePostSuccess = (newPostContent: string) => {
    if (digitalToken) {
      const newPost: Omit<Post, 'id' | 'createdAt'> = {
        content: newPostContent,
        digitalToken: digitalToken,
      };
      addPost(newPost);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container mx-auto max-w-2xl flex-grow px-4 py-8">
        <div className="w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
              Welcome to AnonFlow
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Share your thoughts with the world, anonymously.
            </p>
          </div>

          <PostForm onPostSuccess={handlePostSuccess} />

          {activeUsers.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-center mb-4 text-muted-foreground">Active Users</h2>
              <div className="flex justify-center flex-wrap gap-2">
                <TooltipProvider>
                  {activeUsers.map(token => (
                    <Tooltip key={token}>
                      <TooltipTrigger>
                        <Avatar>
                          <AvatarFallback style={{ backgroundColor: generateAvatarColor(token) }} className="text-primary-foreground font-bold">
                            {token.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Anonymous User</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )}


          <div className="mt-12 space-y-6">
            {isLoading ? (
              <>
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </>
            ) : displayedPosts.length > 0 ? (
              displayedPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-post-in opacity-0"
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-16 px-4 border-2 border-dashed rounded-xl">
                <h3 className="text-lg font-semibold text-foreground">The timeline is silent...</h3>
                <p className="mt-2">Be the first one to break the silence and post something!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Built with ❤️ for anonymous expression.</p>
      </footer>
    </div>
  );
}
