'use client';

import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/lib/types';
import { cn, generateAvatarColor } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { HTMLAttributes } from 'react';
import { UserCircle } from 'lucide-react';

interface PostCardProps extends HTMLAttributes<HTMLDivElement> {
  post: Post;
}

export function PostCard({ post, className, ...props }: PostCardProps) {
  const avatarColor = generateAvatarColor(post.authorToken);
  const avatarInitials = post.authorToken.substring(0, 2).toUpperCase();
  
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
            {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap text-foreground/90">{post.content}</p>
      </CardContent>
    </Card>
  );
}
