'use client';

import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HTMLAttributes, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostCardProps extends HTMLAttributes<HTMLDivElement> {
  post: Post;
  displayName: string;
  photoURL?: string | null;
  currentUserId: string | null;
  onDelete: (postId: string) => void;
}

export function PostCard({ post, displayName, photoURL, className, currentUserId, onDelete, ...props }: PostCardProps) {
  const isCurrentUser = post.userId === currentUserId;
  const [showDelete, setShowDelete] = useState(false);


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

  const FallbackAvatar = () => (
    <AvatarFallback>
        {displayName?.charAt(0).toUpperCase()}
    </AvatarFallback>
  );

  const handleDelete = () => {
    onDelete(post.id);
  }

  return (
    <div
      className={cn(
        "group flex w-full items-end gap-2",
        isCurrentUser ? "justify-end" : "justify-start",
        className
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      {...props}
    >
        {isCurrentUser && (
            <div className={cn("flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", { "opacity-100": showDelete })}>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className='h-7 w-7 text-muted-foreground hover:text-destructive'>
                            <Trash2 className='h-4 w-4' />
                            <span className='sr-only'>Delete Post</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your message.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )}
      {!isCurrentUser && (
        <Avatar className='h-8 w-8'>
            <AvatarImage src={photoURL || undefined} alt={displayName} />
            <FallbackAvatar />
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-md rounded-2xl px-4 py-2",
          isCurrentUser ? "rounded-br-none bg-primary text-primary-foreground" : "rounded-bl-none bg-secondary text-secondary-foreground"
        )}
      >
        <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm">{isCurrentUser ? 'You' : displayName}</span>
            <span className="text-xs opacity-70">
                {getTimestamp()}
            </span>
        </div>
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
      </div>
    </div>
  );
}
