'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Send, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitPost } from '@/app/actions';
import { useState } from 'react';

const PostSchema = z.object({
  content: z.string().min(1, "Post cannot be empty.").max(500, "Post must be 500 characters or less."),
});

type PostFormProps = {
  onPostSuccess: (content: string) => void;
  placeholder?: string;
  isReplyForm?: boolean;
};

export function PostForm({ onPostSuccess, placeholder, isReplyForm = false }: PostFormProps) {
  const { toast } = useToast();
  const [showPicker, setShowPicker] = useState(false);

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      content: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof PostSchema>) {
    const formData = new FormData();
    formData.append('content', values.content);

    const result = await submitPost(formData);

    if (result.success && result.postContent) {
      onPostSuccess(result.postContent);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: result.message,
      });
    }
  }

  function onEmojiClick(emojiData: EmojiClickData) {
    form.setValue('content', form.getValues('content') + emojiData.emoji);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2 sm:gap-4">
        <div className="relative flex-grow">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className='flex-grow'>
                <FormControl>
                  <Textarea
                    placeholder={placeholder || "Type a message..."}
                    className="resize-none rounded-2xl bg-secondary focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 p-2 pr-12 text-sm sm:text-base"
                    rows={1}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="px-2 text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <div className='absolute right-2 top-1/2 -translate-y-1/2'>
            <Popover open={showPicker} onOpenChange={setShowPicker}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full text-muted-foreground'>
                        <Smile className="h-5 w-5" />
                        <span className="sr-only">Open emoji picker</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    side="top" 
                    align="end" 
                    className="p-0 border-none w-full"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <EmojiPicker 
                        onEmojiClick={onEmojiClick}
                        lazyLoadEmojis
                        searchDisabled
                        categories={['smileys_people', 'animals_nature', 'food_drink', 'travel_places', 'activities', 'objects']}
                    />
                </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} size="icon" className="rounded-full flex-shrink-0">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </Form>
  );
}
