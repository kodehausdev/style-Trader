'use server';

/**
 * @fileOverview AI-powered clothing suggestion flow.
 *
 * - generateClothingSuggestions - A function that generates clothing suggestions based on a style request.
 * - GenerateClothingSuggestionsInput - The input type for the generateClothingSuggestions function.
 * - GenerateClothingSuggestionsOutput - The return type for the generateClothingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClothingSuggestionsInputSchema = z.object({
  styleRequest: z.string().describe('A description of the desired clothing style.'),
});
export type GenerateClothingSuggestionsInput = z.infer<typeof GenerateClothingSuggestionsInputSchema>;

const ClothingSuggestionSchema = z.object({
  clothingItem: z.string().describe('The name of the clothing item.'),
  suitabilityExplanation: z.string().describe('An explanation of why this item suits the requested style.'),
});
export type ClothingSuggestion = z.infer<typeof ClothingSuggestionSchema>;


const GenerateClothingSuggestionsOutputSchema = z.object({
  suggestions: z.array(ClothingSuggestionSchema).describe('An array of clothing suggestions with explanations.'),
});
export type GenerateClothingSuggestionsOutput = z.infer<typeof GenerateClothingSuggestionsOutputSchema>;

export async function generateClothingSuggestions(input: GenerateClothingSuggestionsInput): Promise<GenerateClothingSuggestionsOutput> {
  return generateClothingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClothingSuggestionsPrompt',
  input: {schema: GenerateClothingSuggestionsInputSchema},
  output: {schema: GenerateClothingSuggestionsOutputSchema},
  prompt: `You are a personal stylist AI. A user has submitted a style request, and you need to provide clothing suggestions.

Style Request: {{{styleRequest}}}

Suggest three clothing items that match the style request. For each item, explain why it is a good fit.

Format your response as a JSON array of clothing suggestions, each with the clothing item name and a suitability explanation.

Example:
[
  {
    "clothingItem": "Denim Jacket",
    "suitabilityExplanation": "A denim jacket is a versatile piece that can be dressed up or down, making it suitable for various casual styles."
  },
  {
    "clothingItem": "White T-shirt",
    "suitabilityExplanation": "A white t-shirt is a basic wardrobe staple that can be paired with almost anything."
  },
  {
    "clothingItem": "Black Jeans",
    "suitabilityExplanation": "Black jeans are a modern and sleek alternative to blue jeans, suitable for smart-casual looks."
  }
]
`,
});

const generateClothingSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateClothingSuggestionsFlow',
    inputSchema: GenerateClothingSuggestionsInputSchema,
    outputSchema: GenerateClothingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
