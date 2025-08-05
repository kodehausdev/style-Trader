"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/app/page";

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();

  const handleBuyNow = () => {
    toast({
      title: "Coming Soon!",
      description: "Secure payments feature will be available shortly.",
    });
  };

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.aiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
        <p className="text-primary font-semibold mt-2 text-xl">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleBuyNow} className="w-full bg-primary hover:bg-accent hover:text-accent-foreground transition-colors duration-300">
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
