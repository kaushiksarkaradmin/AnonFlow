'use server';

/**
 * @fileOverview A content moderation AI agent for anonymous posts.
 *
 * - moderateAnonymousPost - A function that moderates the content of an anonymous post.
 * - ModerateAnonymousPostInput - The input type for the moderateAnonymousPost function.
 * - ModerateAnonymousPostOutput - The return type for the moderateAnonymousPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateAnonymousPostInputSchema = z.object({
  text: z.string().describe('The text content of the anonymous post.'),
});
export type ModerateAnonymousPostInput = z.infer<typeof ModerateAnonymousPostInputSchema>;

const ModerateAnonymousPostOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe(
      'Whether the content is safe and appropriate for the platform (true) or not (false).'
    ),
  reason: z
    .string()
    .optional()
    .describe('The reason why the content was flagged as unsafe, if applicable.'),
});
export type ModerateAnonymousPostOutput = z.infer<typeof ModerateAnonymousPostOutputSchema>;

export async function moderateAnonymousPost(
  input: ModerateAnonymousPostInput
): Promise<ModerateAnonymousPostOutput> {
  return moderateAnonymousPostFlow(input);
}

const moderateAnonymousPostPrompt = ai.definePrompt({
  name: 'moderateAnonymousPostPrompt',
  input: {schema: ModerateAnonymousPostInputSchema},
  output: {schema: ModerateAnonymousPostOutputSchema},
  prompt: `You are a content moderation AI that determines if the following text is safe and appropriate for an anonymous social media platform.

Text: {{{text}}}

Respond with a JSON object that indicates whether the content is safe (isSafe: true/false) and, if not safe, provide a brief reason (reason: string). Be strict with the content, erring on the side of caution.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const moderateAnonymousPostFlow = ai.defineFlow(
  {
    name: 'moderateAnonymousPostFlow',
    inputSchema: ModerateAnonymousPostInputSchema,
    outputSchema: ModerateAnonymousPostOutputSchema,
  },
  async input => {
    const {output} = await moderateAnonymousPostPrompt(input);
    return output!;
  }
);

