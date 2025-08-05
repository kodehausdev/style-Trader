"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateClothingSuggestions, GenerateClothingSuggestionsOutput } from "@/ai/flows/generate-clothing-suggestions";
import { generateOutfitImage } from "@/ai/flows/generate-outfit-image";
import { generateSpeech } from "@/ai/flows/generate-speech";
import { Loader2, Bookmark, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Image from "next/image";

const formSchema = z.object({
  styleRequest: z.string().min(10, "Please describe your desired style in at least 10 characters."),
  voice: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export interface SavedOutfit {
  id: string;
  styleRequest: string;
  suggestions: GenerateClothingSuggestionsOutput['suggestions'];
  generatedImageUrl: string;
  savedAt: string;
}

const voices = [
    { value: 'Algenib', label: 'Algenib (Male)' },
    { value: 'Achernar', label: 'Achernar (Female)' },
    { value: 'Umbriel', label: 'Umbriel (Female)' },
    { value: 'Zubenelgenubi', label: 'Zubenelgenubi (Male)' },
    { value: 'Schedar', label: 'Schedar (Female)'},
    { value: 'Rasalgethi', label: 'Rasalgethi (Male)'},
];

export function StyleRequestForm() {
  const [suggestions, setSuggestions] = useState<GenerateClothingSuggestionsOutput | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      styleRequest: "",
      voice: "Algenib",
    },
  });

  const styleRequestValue = form.watch("styleRequest");

  const isGetSuggestionsDisabled = isGeneratingSuggestions || isGeneratingMedia || (!!suggestions && styleRequestValue === lastSubmittedRequest);

  const handleSuggestionChange = (index: number, newClothingItem: string) => {
    if (suggestions) {
      const newSuggestions = [...suggestions.suggestions];
      newSuggestions[index] = { ...newSuggestions[index], clothingItem: newClothingItem };
      setSuggestions({ suggestions: newSuggestions });
    }
  };

  const handleUpdateOutfit = async () => {
    if (!suggestions) return;

    setIsGeneratingMedia(true);
    setGeneratedImageUrl(null);
    setAudioUrl(null);
    
    try {
      const outfitDescription = suggestions.suggestions
        .map((s) => s.clothingItem)
        .join(", ");
        
      const spokenText = `Based on your updates, here is the new style. A ${suggestions.suggestions[0].clothingItem}, a ${suggestions.suggestions[1].clothingItem}, and to complete the look, ${suggestions.suggestions[2].clothingItem}. I've created a new visualization for you.`;

      const imagePromise = generateOutfitImage({ outfitDescription });
      const audioPromise = generateSpeech({ textToSpeak: spokenText, voice: form.getValues("voice") });

       const [imageResult, audioResult] = await Promise.all([
        imagePromise.catch(e => {
            console.error("Error generating image:", e);
            toast({ variant: "destructive", title: "Image Generation Failed" });
            return { imageUrl: null };
        }),
        audioPromise.catch(e => {
            console.error("Error generating audio:", e);
            toast({ variant: "destructive", title: "Audio Generation Failed" });
            return { audioUrl: null };
        })
      ]);
      
      if(imageResult.imageUrl) setGeneratedImageUrl(imageResult.imageUrl);
      if(audioResult.audioUrl) setAudioUrl(audioResult.audioUrl);

    } catch (error) {
       console.error("Error updating outfit:", error);
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating the outfit. Please try again.",
      });
    } finally {
        setIsGeneratingMedia(false);
    }
  };

  const handleSave = () => {
    if (!suggestions || !generatedImageUrl) {
        toast({
            variant: "destructive",
            title: "Nothing to save",
            description: "Please generate an outfit before saving.",
        });
        return;
    }

    const newOutfit: SavedOutfit = {
        id: new Date().toISOString(),
        styleRequest: form.getValues("styleRequest"),
        suggestions: suggestions.suggestions,
        generatedImageUrl,
        savedAt: new Date().toISOString(),
    };

    try {
        const savedOutfits: SavedOutfit[] = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
        savedOutfits.unshift(newOutfit);
        localStorage.setItem('savedOutfits', JSON.stringify(savedOutfits));

        toast({
            title: "Outfit Saved!",
            description: "Your new style has been saved.",
            action: (
              <ToastAction altText="View Saved" asChild>
                <Link href="/saved-styles">View</Link>
              </ToastAction>
            ),
        });
    } catch (error) {
        console.error("Failed to save outfit to localStorage", error);
        toast({
            variant: "destructive",
            title: "Failed to save",
            description: "There was an error while trying to save your outfit.",
        });
    }
  };

  async function onSubmit(values: FormValues) {
    setIsGeneratingSuggestions(true);
    setIsGeneratingMedia(false);
    setSuggestions(null);
    setGeneratedImageUrl(null);
    setAudioUrl(null);
    setLastSubmittedRequest(values.styleRequest);

    try {
      const suggestionResult = await generateClothingSuggestions({ styleRequest: values.styleRequest });
      setSuggestions(suggestionResult);
      setIsGeneratingSuggestions(false);

      setIsGeneratingMedia(true);

      const outfitDescription = suggestionResult.suggestions
        .map((s) => s.clothingItem)
        .join(", ");
        
      const spokenText = `Here are your style suggestions. First, a ${suggestionResult.suggestions[0].clothingItem}, because ${suggestionResult.suggestions[0].suitabilityExplanation}. Next, I'd recommend a ${suggestionResult.suggestions[1].clothingItem}, as ${suggestionResult.suggestions[1].suitabilityExplanation}. Finally, to complete the look, how about ${suggestionResult.suggestions[2].clothingItem}? ${suggestionResult.suggestions[2].suitabilityExplanation}. I've also created a visualization of the complete outfit for you.`;

      const imagePromise = generateOutfitImage({ outfitDescription });
      const audioPromise = generateSpeech({ textToSpeak: spokenText, voice: values.voice });

      const [imageResult, audioResult] = await Promise.all([
        imagePromise.catch(e => {
            console.error("Error generating image:", e);
            toast({ variant: "destructive", title: "Image Generation Failed" });
            return { imageUrl: null };
        }),
        audioPromise.catch(e => {
            console.error("Error generating audio:", e);
            toast({ variant: "destructive", title: "Audio Generation Failed" });
            return { audioUrl: null };
        })
      ]);
      
      if(imageResult.imageUrl) setGeneratedImageUrl(imageResult.imageUrl);
      if(audioResult.audioUrl) setAudioUrl(audioResult.audioUrl);

    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with the AI stylist. Please try again later.",
      });
      setIsGeneratingSuggestions(false);
    } finally {
      setIsGeneratingMedia(false);
    }
  }

  return (
    <div id="ai-stylist" className="py-12 md:py-24">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-center">AI Personal Stylist</CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            Describe your fashion goals, select a voice, and let our AI find the perfect pieces and visualize the result for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="styleRequest"
                        render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Style Request</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="e.g., 'A smart-casual outfit for a summer wedding...'"
                                className="min-h-[100px] resize-none"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="voice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>AI Voice</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a voice" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {voices.map((voice) => (
                                    <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                    />
                </div>
              <Button type="submit" disabled={isGetSuggestionsDisabled} className="w-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                {isGeneratingSuggestions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Your Style...
                  </>
                ) : isGeneratingMedia ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bringing it to Life...
                  </>
                ) : (
                  "Get Suggestions"
                )}
              </Button>
            </form>
          </Form>

          {(isGeneratingSuggestions || suggestions) && (
            <div className="mt-8 pt-8 border-t animate-in fade-in-50 duration-500">
               <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
                <h3 className="text-2xl font-headline">Your AI-Generated Style</h3>
                {suggestions && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleUpdateOutfit} disabled={isGeneratingMedia}>
                            {isGeneratingMedia ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Update Outfit
                        </Button>
                        <Button variant="outline" onClick={handleSave} disabled={isGeneratingMedia || !generatedImageUrl}>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Save
                        </Button>
                    </div>
                )}
              </div>

              {audioUrl && (
                <div className="mb-8">
                  <h4 className="text-xl font-headline mb-2 text-center">Audio Summary</h4>
                  <audio controls src={audioUrl} className="w-full rounded-lg">
                      Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h4 className="text-xl font-headline mb-4 text-center">Co-design Suggestions</h4>
                    {suggestions ? (
                      <div className="space-y-4">
                        {suggestions.suggestions.map((suggestion, index) => (
                          <Card key={index} className="bg-background/70 p-4 space-y-2">
                              <Label htmlFor={`suggestion-${index}`} className="font-headline text-lg">{`Item ${index + 1}`}</Label>
                              <Input 
                                id={`suggestion-${index}`}
                                value={suggestion.clothingItem}
                                onChange={(e) => handleSuggestionChange(index, e.target.value)}
                                className="text-base"
                                disabled={isGeneratingMedia}
                              />
                              <p className="text-sm text-muted-foreground pt-1">{suggestion.suitabilityExplanation}</p>
                          </Card>
                        ))}
                      </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Generating suggestions...</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-headline mb-4 text-center">Visualized Outfit</h4>
                    <div className="relative aspect-[4/5] w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {(isGeneratingMedia || isGeneratingSuggestions) && !generatedImageUrl ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span>Bringing your outfit to life...</span>
                        </div>
                      ) : generatedImageUrl ? (
                        <Image
                          src={generatedImageUrl}
                          alt="AI generated outfit"
                          fill
                          className="object-cover animate-in fade-in-50 duration-500"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground p-4">
                          <p>Your outfit visualization will appear here once suggestions are ready.</p>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
