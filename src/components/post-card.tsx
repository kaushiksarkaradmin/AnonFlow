'use client';

import { formatDistanceToNow } from 'date-fns';
import type { Post, UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HTMLAttributes, useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Check, CheckCheck, Trash2 } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface PostCardProps extends HTMLAttributes<HTMLDivElement> {
  post: Post;
  displayName: string;
  photoURL?: string | null;
  currentUserId: string | null;
  onDelete: (postId: string) => void;
  onSeen: (postId: string) => void;
  seenByUsers: UserProfile[];
}

export function PostCard({ post, displayName, photoURL, className, currentUserId, onDelete, onSeen, seenByUsers, ...props }: PostCardProps) {
  const isCurrentUser = post.userId === currentUserId;
  const [showDelete, setShowDelete] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const hasBeenSeen = seenByUsers.length > 0;

  useEffect(() => {
    if (!cardRef.current || isCurrentUser) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Check if the current user has already seen this post
          if (!post.seenBy?.includes(currentUserId!)) {
            onSeen(post.id);
          }
          observer.disconnect(); // We only need to know once
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [post.id, onSeen, isCurrentUser, currentUserId, post.seenBy]);


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

  const FallbackAvatar = ({name}: {name?: string}) => (
    <AvatarFallback>
        {(name || displayName)?.charAt(0).toUpperCase()}
    </AvatarFallback>
  );

  const handleDelete = () => {
    onDelete(post.id);
  }

  const SeenIcon = () => {
    if (!isCurrentUser) return null;
    return (
       <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
          {hasBeenSeen ? 
            <CheckCheck size={16} className='text-blue-400' /> : 
            <Check size={16} />
          }
       </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "group flex w-full flex-col items-end gap-2",
        isCurrentUser ? "items-end" : "items-start",
        className
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      {...props}
    >
      <div className={cn("flex items-end gap-2", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
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
      </div>

       {isCurrentUser && (
        <div className='flex items-center gap-2 pr-4'>
            <SeenIcon />
            {hasBeenSeen && (
            <TooltipProvider>
                <Tooltip>
                <TooltipTrigger>
                    <div className="flex -space-x-2">
                    {seenByUsers.slice(0, 3).map(user => (
                        <Avatar key={user.id} className="h-4 w-4 border-2 border-background">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
                            <FallbackAvatar name={user.displayName}/>
                        </Avatar>
                    ))}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className='text-xs'>
                        Seen by {seenByUsers.map(u => u.displayName).join(', ')}
                    </p>
                </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            )}
        </div>
        )}
    </div>
  );
}
