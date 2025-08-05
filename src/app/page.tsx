
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { StyleRequestForm } from "@/components/StyleRequestForm";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import products from "@/data/products.json";

export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  aiHint: string;
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative text-center py-20 md:py-32 px-4 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
             <Image 
                src="/images/fashion-hero.jpg" 
                alt="Fashion background" 
                fill
                className="object-cover opacity-50"
                data-ai-hint="fashion runway"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-headline font-bold">Dress with Intelligence</h2>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
              Discover your unique style. Request custom designs, negotiate prices, and get AI-powered recommendations.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-accent hover:text-accent-foreground transition-colors duration-300">
                <a href="#catalog">Shop Now</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#ai-stylist">AI Stylist</a>
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8">
          <StyleRequestForm />

          <section id="catalog" className="py-12 md:py-24">
            <h3 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">Our Collection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {(products as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
