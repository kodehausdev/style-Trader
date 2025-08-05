'use client';

import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Trash2, Share2 } from "lucide-react";
import type { SavedOutfit } from "./StyleRequestForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface SavedOutfitCardProps {
  outfit: SavedOutfit;
  onDelete: (id: string) => void;
}

export function SavedOutfitCard({ outfit, onDelete }: SavedOutfitCardProps) {
  const { toast } = useToast();

  const handleShare = () => {
    try {
      const encodedData = encodeURIComponent(JSON.stringify({ styleRequest: outfit.styleRequest }));
      const shareUrl = `${window.location.origin}/share/${encodedData}`;
      
      navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Link Copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to create share link", error);
      toast({
        variant: "destructive",
        title: "Failed to Share",
        description: "Could not create a shareable link for this outfit.",
      });
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
            <CardTitle className="font-headline text-xl">{outfit.styleRequest}</CardTitle>
            <CardDescription>Saved on {new Date(outfit.savedAt).toLocaleDateString()}</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share outfit</span>
          </Button>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                      <Trash2 className="h-5 w-5 text-destructive" />
                      <span className="sr-only">Delete outfit</span>
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently delete this saved style.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(outfit.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6 flex-grow">
        <div className="relative aspect-[4/5] w-full bg-muted rounded-lg overflow-hidden">
          <Image
            src={outfit.generatedImageUrl}
            alt={`AI generated outfit for: ${outfit.styleRequest}`}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold">Suggested Items:</h4>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            {outfit.suggestions.map((item, index) => (
              <li key={index}>{item.clothingItem}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
