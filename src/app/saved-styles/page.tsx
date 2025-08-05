'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SavedOutfitCard } from "@/components/SavedOutfitCard";
import type { SavedOutfit } from "@/components/StyleRequestForm";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookmarkX, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"


export default function SavedStylesPage() {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedOutfits = localStorage.getItem('savedOutfits');
      if (storedOutfits) {
        setSavedOutfits(JSON.parse(storedOutfits));
      }
    } catch (error) {
      console.error("Could not parse saved outfits from localStorage", error);
      setSavedOutfits([]);
    }
  }, []);

  const handleDelete = (id: string) => {
    const updatedOutfits = savedOutfits.filter(outfit => outfit.id !== id);
    setSavedOutfits(updatedOutfits);
    localStorage.setItem('savedOutfits', JSON.stringify(updatedOutfits));
  };
  
  const handleClearAll = () => {
    setSavedOutfits([]);
    localStorage.removeItem('savedOutfits');
  }

  if (!isClient) {
      return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-12">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Your Saved Styles</h2>
            {savedOutfits.length > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                          <BookmarkX className="mr-2 h-4 w-4" />
                          Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your saved styles.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>

        {savedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {savedOutfits.map(outfit => (
              <SavedOutfitCard key={outfit.id} outfit={outfit} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Saved Styles Yet</h3>
            <p className="text-muted-foreground mt-2">
              Go to the AI Stylist to generate and save your first outfit!
            </p>
            <Button asChild className="mt-6">
              <Link href="/#ai-stylist">Go to AI Stylist</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
