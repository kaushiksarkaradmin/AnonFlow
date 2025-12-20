'use server';

import { z } from 'zod';

const postSchema = z.object({
  content: z.string().min(1, "Post cannot be empty.").max(500, "Post cannot be longer than 500 characters."),
});

type PostSubmitState = {
  success: boolean;
  message: string;
  postContent?: string;
};

export async function submitPost(formData: FormData): Promise<PostSubmitState> {
  const validatedFields = postSchema.safeParse({
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.errors[0].message,
    };
  }

  // Content moderation is removed as the chat is now private
  return {
    success: true,
    message: "Post submitted!",
    postContent: validatedFields.data.content,
  };
}
