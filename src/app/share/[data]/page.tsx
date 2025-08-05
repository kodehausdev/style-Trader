'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateClothingSuggestions, GenerateClothingSuggestionsOutput } from '@/ai/flows/generate-clothing-suggestions';
import { generateOutfitImage } from '@/ai/flows/generate-outfit-image';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SharedData {
  styleRequest: string;
}

interface OutfitDetails {
  styleRequest: string;
  suggestions: GenerateClothingSuggestionsOutput['suggestions'];
  savedAt: string; // Keep this for display
}

export default function SharePage() {
  const params = useParams();
  const [outfit, setOutfit] = useState<OutfitDetails | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.data && typeof params.data === 'string') {
      try {
        const decodedData = decodeURIComponent(params.data);
        const parsedData: SharedData = JSON.parse(decodedData);
        
        const generateFullOutfit = async () => {
          try {
            // 1. Generate suggestions from the style request
            const suggestionResult = await generateClothingSuggestions({ styleRequest: parsedData.styleRequest });
            
            if (!suggestionResult || !suggestionResult.suggestions || suggestionResult.suggestions.length === 0) {
              throw new Error("Could not generate style suggestions.");
            }
            
            setOutfit({
              styleRequest: parsedData.styleRequest,
              suggestions: suggestionResult.suggestions,
              savedAt: new Date().toISOString(), // Use current date for display
            });
            
            // 2. Generate image from the new suggestions
            const outfitDescription = suggestionResult.suggestions
              .map(s => s.clothingItem)
              .join(', ');
            const imageResult = await generateOutfitImage({ outfitDescription });

            if (imageResult.imageUrl) {
              setImageUrl(imageResult.imageUrl);
            } else {
              throw new Error("Image generation returned no URL.");
            }
          } catch (e) {
            console.error("Failed to generate full outfit for shared style", e);
            let message = "Could not generate the outfit. Please try again later.";
            if (e instanceof Error) message = e.message;
            setError(message);
          } finally {
            setIsLoading(false);
          }
        };

        generateFullOutfit();

      } catch (e) {
        console.error("Failed to decode or parse shared data", e);
        setError("The shared link is invalid or corrupted.");
        setIsLoading(false);
      }
    }
  }, [params.data]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-8">A Shared Style</h2>
        
        {(isLoading || error) && (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground h-96 justify-center">
                            <Loader2 className="h-12 w-12 animate-spin" />
                            <p className="text-lg">Crafting the shared style...</p>
                            <p>This might take a moment.</p>
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Generation Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}
                </CardContent>
            </Card>
        )}

        {!isLoading && !error && outfit && (
          <Card className="max-w-2xl mx-auto overflow-hidden">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{outfit.styleRequest}</CardTitle>
                <CardDescription>Style generated on {new Date(outfit.savedAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
             <CardContent className="space-y-6">
                <div className="relative aspect-[4/5] w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={`AI generated outfit for: ${outfit.styleRequest}`}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <p>Could not display outfit visualization.</p>
                    </div>
                )}
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Suggested Items:</h4>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                    {outfit.suggestions.map((item, index) => (
                      <li key={index} className="ml-4">{item.clothingItem}</li>
                    ))}
                  </ul>
                </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
