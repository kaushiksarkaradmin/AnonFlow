'use client';

import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/lib/types';
import { cn, generateAvatarColor } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { HTMLAttributes } from 'react';

interface PostCardProps extends HTMLAttributes<HTMLDivElement> {
  post: Post;
}

export function PostCard({ post, className, ...props }: PostCardProps) {
  const avatarColor = generateAvatarColor(post.digitalToken);
  const avatarInitials = post.digitalToken.substring(0, 2).toUpperCase();
  
  const getTimestamp = () => {
    if (!post.createdAt) return 'a moment ago';
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
    <Card className={cn("overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300", className)} {...props}>
      <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card">
        <Avatar>
          <AvatarFallback style={{ backgroundColor: avatarColor }} className="text-primary-foreground font-bold">
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">Anonymous</span>
          <span className="text-xs text-muted-foreground">
            {getTimestamp()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap text-foreground/90">{post.content}</p>
      </CardContent>
    </Card>
  );
}
