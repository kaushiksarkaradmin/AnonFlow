'use client';

import { SiteHeader } from '@/components/site-header';
import { PostForm } from '@/components/post-form';
import { PostCard } from '@/components/post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePosts } from '@/hooks/use-posts';
import { useAnonUser } from '@/hooks/use-anon-user';
import type { Post } from '@/lib/types';

export default function Home() {
  const { posts, addPost, isLoading } = usePosts();
  const userToken = useAnonUser();

  const handlePostSuccess = (newPostContent: string) => {
    if (userToken) {
      const newPost: Post = {
        id: `${Date.now()}-${userToken}`,
        content: newPostContent,
        authorToken: userToken,
        timestamp: Date.now(),
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

          <div className="mt-12 space-y-6">
            {isLoading ? (
              <>
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </>
            ) : posts.length > 0 ? (
              posts.map((post, index) => (
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
