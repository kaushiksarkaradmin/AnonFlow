'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitPost } from '@/app/actions';

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
      if (!isReplyForm) {
        // We can optionally keep a toast for success, but it's less common in chat apps.
        // toast({
        //     title: 'Success!',
        //     description: 'Your anonymous post is now live.',
        // });
      }
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
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Textarea
                  placeholder={placeholder || "Type a message..."}
                  className="resize-none rounded-2xl bg-secondary focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 p-2 text-sm sm:text-base"
                  rows={1}
                  {...field}
                />
              </FormControl>
              <FormMessage className="px-2 text-xs sm:text-sm" />
            </FormItem>
          )}
        />
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
