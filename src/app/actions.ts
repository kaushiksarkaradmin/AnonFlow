'use server';

import { moderateAnonymousPost } from '@/ai/flows/moderate-anonymous-posts';
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

  try {
    const moderationResult = await moderateAnonymousPost({ text: validatedFields.data.content });

    if (!moderationResult.isSafe) {
      return {
        success: false,
        message: moderationResult.reason || "This post was flagged by our content moderation system.",
      };
    }

    return {
      success: true,
      message: "Post submitted!",
      postContent: validatedFields.data.content,
    };
  } catch (error) {
    console.error("Error during post submission:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
