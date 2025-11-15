
'use client';

import { SiteHeader } from '@/components/site-header';
import { PostForm } from '@/components/post-form';
import { PostCard } from '@/components/post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePosts } from '@/hooks/use-posts';
import { useAnonUser } from '@/hooks/use-anon-user';
import type { Post, UserToken } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateAvatarColor } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

// Fisher-Yates shuffle algorithm
function shufflePosts(array: Post[]): Post[] {
  if (!array) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    // This is safe to run on client only, and a new random number on each shuffle is intended.
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function Home() {
  const { posts, addPost, isLoading } = usePosts();
  const { digitalToken, displayName } = useAnonUser();
  const firestore = useFirestore();
  const [showActivityLog, setShowActivityLog] = useState(false);

  const userTokensCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'userTokens') : null),
    [firestore]
  );
  const { data: userTokens } = useCollection<UserToken>(userTokensCollection);

  const handlePostSuccess = (newPostContent: string) => {
    if (digitalToken) {
      const newPost: Omit<Post, 'id' | 'createdAt'> = {
        content: newPostContent,
        digitalToken: digitalToken,
      };
      addPost(newPost);
    }
  };

  const handleReply = (replyContent: string, parentId: string) => {
    if (digitalToken) {
      const newReply: Omit<Post, 'id' | 'createdAt'> = {
        content: replyContent,
        digitalToken: digitalToken,
        parentId: parentId,
      };
      addPost(newReply);
    }
  };
  
  const userTokenMap = useMemo(() => {
    return userTokens?.reduce((acc, token) => {
      acc[token.digitalToken] = token.displayName;
      return acc;
    }, {} as Record<string, string>) || {};
  }, [userTokens]);

  const { threadedPosts, postMap } = useMemo(() => {
    if (!posts) return { threadedPosts: [], postMap: {} };
    
    const postMap: Record<string, Post> = {};
    const topLevelPosts: Post[] = [];

    posts.forEach(post => {
        post.replies = [];
        postMap[post.id] = post;
    });

    posts.forEach(post => {
        if (post.parentId && postMap[post.parentId]) {
            postMap[post.parentId].replies?.push(post);
        } else {
            topLevelPosts.push(post);
        }
    });

    return { threadedPosts: topLevelPosts, postMap };
  }, [posts]);


  const displayedPosts = useMemo(() => {
    if (threadedPosts && threadedPosts.length > 0) {
      const [newest, ...rest] = threadedPosts;
      const shuffledRest = shufflePosts(rest);
      return [newest, ...shuffledRest];
    }
    return threadedPosts || [];
  }, [threadedPosts]);

  const getActivityTimestamp = (post: Post) => {
    if (!post.createdAt) return '';
    if (post.createdAt instanceof Date) {
      return formatDistanceToNow(post.createdAt, { addSuffix: true });
    }
    // Handle Firestore ServerTimestamp
    if ('toDate' in post.createdAt) {
      return formatDistanceToNow((post.createdAt as any).toDate(), { addSuffix: true });
    }
    // Fallback for string or number
    return formatDistanceToNow(new Date(post.createdAt as any), { addSuffix: true });
  }

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
            {displayName && (
              <p className="mt-4 text-xl text-foreground">
                Hi! <span className="font-semibold text-primary">{displayName}</span>
              </p>
            )}
             {posts.length > 0 && (
              <div className="mt-4">
                <Button variant="outline" onClick={() => setShowActivityLog(!showActivityLog)}>
                  {showActivityLog ? 'Hide Flow Log' : 'View Flow Log'}
                </Button>
                {showActivityLog && (
                  <div className="mt-4">
                    <Card>
                      <CardContent className="p-4 space-y-3 text-left">
                        {posts.slice(0, 5).map(post => (
                          <div key={post.id} className="text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">{userTokenMap[post.digitalToken] || 'Anonymous'}</span>
                            {post.parentId && postMap[post.parentId] ? (
                              <>
                                <span> has replied to </span>
                                <span className="font-semibold text-primary">{userTokenMap[postMap[post.parentId].digitalToken] || 'Anonymous'}</span>
                                <span>'s post.</span>
                              </>
                            ) : (
                              <span> has posted on the Flow.</span>
                            )}
                            <span className="text-xs ml-2">({getActivityTimestamp(post)})</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>

          <PostForm onPostSuccess={handlePostSuccess} />

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
                  displayName={userTokenMap[post.digitalToken] || 'Anonymous'}
                  onReply={handleReply}
                  userTokenMap={userTokenMap}
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
