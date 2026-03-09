const FooterSection = () => {
  return (
    <footer className="py-16 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-2">
              <span className="text-gradient-cheese">Brie</span>Hosting<span className="text-secondary">.be</span>
            </h3>
            <p className="text-muted-foreground font-meme text-sm max-w-sm">
              Belgian hosting that slaps harder than a waffle iron at 6AM. Made with 🧀 in Belgium.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="#features">Features</a></li>
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="/features">Full Features</a></li>
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="#pricing">Pricing</a></li>
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="/status">Status Page</a></li>
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="/blog">Blog</a></li>
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="/interns">Interns</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">Legal Stuff</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="/terms">Terms of Service</a></li>
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="/privacy">Privacy Policy</a></li>
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="/cookies">Cookie Policy 🍪</a></li>
              <li className="hover:text-primary cursor-pointer transition-colors"><a href="/privacy">GDPR (we got you)</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-meme">
            © 2026 BrieHosting.be — All rights reserved. No cheese was harmed in the making of this website.
          </p>
          <p className="text-xs text-muted-foreground font-meme">
            Made with ❤️ and 🧀 in Belgium
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
