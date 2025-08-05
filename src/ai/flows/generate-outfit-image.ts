'use server';
/**
 * @fileOverview AI-powered outfit image generation.
 *
 * - generateOutfitImage - A function that generates an image of an outfit based on a description.
 * - GenerateOutfitImageInput - The input type for the generateOutfitImage function.
 * - GenerateOutfitImageOutput - The return type for the generateOutfitImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOutfitImageInputSchema = z.object({
  outfitDescription: z.string().describe('A detailed description of the outfit to generate an image for.'),
});
export type GenerateOutfitImageInput = z.infer<typeof GenerateOutfitImageInputSchema>;

const GenerateOutfitImageOutputSchema = z.object({
  imageUrl: z.string().describe("A data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateOutfitImageOutput = z.infer<typeof GenerateOutfitImageOutputSchema>;

export async function generateOutfitImage(input: GenerateOutfitImageInput): Promise<GenerateOutfitImageOutput> {
  return generateOutfitImageFlow(input);
}

const generateOutfitImageFlow = ai.defineFlow(
  {
    name: 'generateOutfitImageFlow',
    inputSchema: GenerateOutfitImageInputSchema,
    outputSchema: GenerateOutfitImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A high-quality, photorealistic image of an outfit for a fashion catalog, styled professionally. The outfit consists of: ${input.outfitDescription}. The image should be on a clean, light-colored studio background, focusing solely on the clothing. Do not include any models, text, or logos.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed.');
    }
    
    return { imageUrl: media.url };
  }
);
