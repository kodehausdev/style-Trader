import { ShoppingBag, Bookmark } from "lucide-react";
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary">StyleTrader</Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#catalog" className="hover:text-primary transition-colors">Catalog</a>
          <a href="/#ai-stylist" className="hover:text-primary transition-colors">AI Stylist</a>
          <Link href="/saved-styles" className="hover:text-primary transition-colors">Saved Styles</Link>
          <a href="/#contact" className="hover:text-primary transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-4">
            <Link href="/saved-styles" className="md:hidden text-foreground hover:text-primary transition-colors">
                <Bookmark className="h-6 w-6" />
            </Link>
            <button className="relative">
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
            </button>
        </div>
      </div>
    </header>
  );
}
