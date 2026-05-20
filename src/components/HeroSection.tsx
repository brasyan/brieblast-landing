import heroBrie from "@/assets/hero-brie.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src={heroBrie} alt="Brie cheese server in space" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-4 sm:mb-6 px-3 sm:px-4 py-2 rounded-full border border-primary/30 bg-primary/10 animate-pulse-glow">
          <span className="text-primary font-meme text-xs sm:text-sm md:text-base">🧀 Now with 69% more uptime* 🧀</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="text-gradient-cheese">Brie</span>
          <span className="text-foreground">Hosting</span>
          <span className="text-secondary">.be</span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4 font-meme">
          The hosting that's so gouda, your website will melt... in a good way. 🫕
        </p>

        <p className="text-xs sm:text-sm text-muted-foreground mb-8 sm:mb-10 font-meme">
          *compared to hosting your site on a literal wheel of cheese
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <a href="#pricing" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-primary text-primary-foreground font-bold text-base sm:text-lg glow-cheese hover:scale-105 transition-transform text-center">
            Get Started 🚀
          </a>
          <a href="#pricing" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg border border-secondary text-secondary font-bold text-base sm:text-lg hover:bg-secondary/10 transition-colors text-center">
            Pricing 💸
          </a>
        </div>

        <div className="mt-12 sm:mt-16 flex items-center justify-center gap-4 sm:gap-8 text-muted-foreground text-xs sm:text-sm">
          <span>✅ No BS</span>
          <span className="hidden sm:inline">✅ Actually Fast</span>
          <span>✅ Belgian Quality™</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-0 w-full animate-bounce text-center text-muted-foreground">
        ↓ scroll if you dare ↓
      </div>
    </section>
  );
};

export default HeroSection;
