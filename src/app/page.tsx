
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAnonUser } from '@/hooks/use-anon-user';
import { usePosts } from '@/hooks/use-posts';
import { PostCard } from '@/components/post-card';
import { PostForm } from '@/components/post-form';
import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { UserToken } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const { digitalToken } = useAnonUser();
  const { posts, isLoading, addPost } = usePosts();
  const firestore = useFirestore();

  const [userTokenMap, setUserTokenMap] = useState<Record<string, string>>({});
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    async function fetchUserTokens() {
      if (!firestore) return;
      setIsMapLoading(true);
      const q = query(collection(firestore, 'userTokens'));
      const querySnapshot = await getDocs(q);
      const map: Record<string, string> = {};
      querySnapshot.forEach(doc => {
        const userToken = doc.data() as UserToken;
        map[doc.id] = userToken.displayName;
      });
      setUserTokenMap(map);
      setIsMapLoading(false);
    }
    fetchUserTokens();
  }, [firestore]);

  const handlePostSubmit = (content: string) => {
    if (digitalToken) {
      addPost({ content, digitalToken, parentId: undefined });
    }
  };

  const handleReply = (content: string, parentId: string) => {
    if (digitalToken) {
      addPost({ content, digitalToken, parentId });
    }
  };

  const topLevelPosts = useMemo(() => {
    const postMap = new Map(posts.map(p => [p.id, { ...p, replies: [] as any[] }]));
    const topLevel = [];
    for (const post of posts) {
      if (post.parentId && postMap.has(post.parentId)) {
        postMap.get(post.parentId)!.replies.push(post);
      } else if (!post.parentId) {
        topLevel.push(postMap.get(post.id)!);
      }
    }
    return topLevel;
  }, [posts]);
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <SiteHeader />
      <ScrollArea className="flex-grow">
        <main className="container mx-auto max-w-2xl flex-grow px-4 py-8">
          <div className="space-y-4">
            {(isLoading || isMapLoading) && (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            )}
            {!isLoading && !isMapLoading && topLevelPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                displayName={userTokenMap[post.digitalToken] || 'Anonymous'}
                currentDigitalToken={digitalToken}
                onReply={handleReply}
                userTokenMap={userTokenMap}
              />
            ))}
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
