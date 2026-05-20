import { Link } from "react-router-dom";

const FooterSection = () => {
  return (
    <footer className="py-12 sm:py-16 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="sm:col-span-2 md:col-span-2">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              <span className="text-gradient-cheese">Brie</span>Hosting<span className="text-secondary">.be</span>
            </h3>
            <p className="text-muted-foreground font-meme text-xs sm:text-sm max-w-sm">
              Belgian hosting that slaps harder than a waffle iron at 6AM. Made with 🧀 in Belgium.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Links</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors"><a href="/#features">Features</a></li>
              <li className="hover:text-primary transition-colors"><a href="/features">Full Features</a></li>
              <li className="hover:text-primary transition-colors"><a href="/#pricing">Pricing</a></li>
              <li className="hover:text-primary transition-colors"><a href="/status">Status Page</a></li>
              <li className="hover:text-primary transition-colors"><a href="/blog">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Legal</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors"><Link to="/terms">Terms</Link></li>
              <li className="hover:text-primary transition-colors"><Link to="/privacy">Privacy</Link></li>
              <li className="hover:text-primary transition-colors"><Link to="/privacy">Cookies 🍪</Link></li>
              <li className="hover:text-primary transition-colors"><Link to="/privacy">GDPR</Link></li>
              <li className="hover:text-primary transition-colors"><Link to="/responsible-disclosure">Disclosure</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs text-muted-foreground font-meme text-center sm:text-left">
            © 2026 BrieHosting.be — All rights reserved. No cheese was harmed.
          </p>
          <p className="text-xs text-muted-foreground font-meme">
            Made with ❤️ and 🧀
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
