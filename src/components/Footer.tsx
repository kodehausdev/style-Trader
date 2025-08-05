export function Footer() {
  return (
    <footer id="contact" className="py-6 px-4 md:px-8 border-t border-border/40 mt-12">
      <div className="container mx-auto text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StyleTrader. All rights reserved.</p>
        <p className="mt-2 text-sm">Negotiate prices by contacting us at <a href="mailto:negotiate@styletrader.com" className="text-primary hover:underline">negotiate@styletrader.com</a></p>
      </div>
    </footer>
  );
}
