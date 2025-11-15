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
import { Card, CardContent } from '@/components/ui/card';

const PostSchema = z.object({
  content: z.string().min(1, "Post cannot be empty.").max(500, "Post must be 500 characters or less."),
});

type PostFormProps = {
  onPostSuccess: (content: string) => void;
};

export function PostForm({ onPostSuccess }: PostFormProps) {
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
      toast({
        title: 'Success!',
        description: 'Your anonymous post is now live.',
      });
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
    <Card>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="What's on your mind? Share it anonymously..."
                      className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-base"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="px-2" />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Post Anonymously
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
