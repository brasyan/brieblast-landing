const NavBar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="font-bold text-xl hover:opacity-80 transition-opacity">
          <span className="text-gradient-cheese">Brie</span>
          <span className="text-foreground">Hosting</span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <a href="/status" className="hover:text-primary transition-colors">Status</a>
          <a href="/team" className="hover:text-primary transition-colors">Team</a>
        </div>
        <a href="/login" className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform">
          Login 🧀
        </a>
      </div>
    </nav>
  );
};

export default NavBar;
