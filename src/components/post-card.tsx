
'use client';

import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface PostCardProps extends HTMLAttributes<HTMLDivElement> {
  post: Post;
  displayName: string;
  currentDigitalToken: string | null;
}

export function PostCard({ post, displayName, className, currentDigitalToken, ...props }: PostCardProps) {
  const isCurrentUser = post.digitalToken === currentDigitalToken;

  const getTimestamp = () => {
    if (!post.createdAt) return 'a moment ago';
    // Check if it's a Firestore Timestamp
    if (typeof post.createdAt === 'object' && post.createdAt !== null && 'toDate' in post.createdAt) {
      return formatDistanceToNow((post.createdAt as any).toDate(), { addSuffix: true });
    }
    // Handle if it's already a Date object
    if (post.createdAt instanceof Date) {
      return formatDistanceToNow(post.createdAt, { addSuffix: true });
    }
     // Fallback for string or number
    return formatDistanceToNow(new Date(post.createdAt as any), { addSuffix: true });
  }

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2",
        isCurrentUser ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "max-w-md rounded-2xl px-4 py-2",
          isCurrentUser ? "rounded-br-none bg-primary text-primary-foreground" : "rounded-bl-none bg-secondary text-secondary-foreground"
        )}
      >
        <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm">{displayName}</span>
            <span className="text-xs opacity-70">
                {getTimestamp()}
            </span>
        </div>
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
      </div>
    </div>
  );
}
