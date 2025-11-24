'use client';

import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/lib/types';
import { cn, generateAvatarColor } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';
import { PostForm } from './post-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { usePosts } from '@/hooks/use-posts';
import { useAnonUser } from '@/hooks/use-anon-user';

interface PostCardProps extends HTMLAttributes<HTMLDivElement> {
  post: Post;
  displayName: string;
  onReply: (content: string, parentId: string) => void;
  userTokenMap: Record<string, string>;
}

export function PostCard({ post, displayName, className, onReply, userTokenMap, ...props }: PostCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const { digitalToken } = useAnonUser();
  const { addReaction } = usePosts();
  const avatarColor = generateAvatarColor(post.digitalToken);
  const avatarInitials = displayName.substring(0, 2).toUpperCase();
  
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

  const handleReplySuccess = (replyContent: string) => {
    onReply(replyContent, post.id);
    setIsReplying(false);
  };

  const handleReaction = (reaction: 'likes' | 'dislikes') => {
    if (digitalToken) {
      addReaction(post.id, digitalToken, reaction);
    }
  };

  const hasReplies = post.replies && post.replies.length > 0;
  const likesCount = post.reactions?.likes?.length || 0;
  const dislikesCount = post.reactions?.dislikes?.length || 0;
  const userHasLiked = digitalToken ? post.reactions?.likes?.includes(digitalToken) : false;
  const userHasDisliked = digitalToken ? post.reactions?.dislikes?.includes(digitalToken) : false;

  return (
    <Card className={cn("overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300", className)} {...props}>
      <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card">
        <Avatar>
          <AvatarFallback style={{ backgroundColor: avatarColor }} className="text-primary-foreground font-bold">
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {getTimestamp()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap text-foreground/90">{post.content}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end items-center gap-4">
        {hasReplies && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                View {post.replies?.length} {post.replies?.length === 1 ? 'Reply' : 'Replies'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Replies</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-6">
                <div className="space-y-4">
                  {post.replies?.map((reply) => (
                    <PostCard
                      key={reply.id}
                      post={reply}
                      displayName={userTokenMap[reply.digitalToken] || 'Anonymous'}
                      onReply={onReply}
                      userTokenMap={userTokenMap}
                      className="shadow-none border"
                    />
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
        {!post.parentId && (
             <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Reply
            </Button>
        )}
        <div className="flex items-center gap-1">
          <Button variant={userHasLiked ? "secondary" : "ghost"} size="sm" onClick={() => handleReaction('likes')}>
            <ThumbsUp className={cn("mr-2 h-4 w-4", userHasLiked && "text-primary")} />
            Like
          </Button>
          <span className="text-xs font-semibold text-muted-foreground w-4 text-center">{likesCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant={userHasDisliked ? "secondary" : "ghost"} size="sm" onClick={() => handleReaction('dislikes')}>
            <ThumbsDown className={cn("mr-2 h-4 w-4", userHasDisliked && "text-destructive")} />
            Dislike
          </Button>
          <span className="text-xs font-semibold text-muted-foreground w-4 text-center">{dislikesCount}</span>
        </div>
      </CardFooter>
      
      {isReplying && (
        <div className="p-4 border-t">
          <PostForm onPostSuccess={handleReplySuccess} placeholder="Write a reply..." isReplyForm={true} />
        </div>
      )}
    </Card>
  );
}