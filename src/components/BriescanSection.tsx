const BriescanSection = () => {
  return (
    <section aria-labelledby="briescan-title" className="relative px-4 -mt-12 sm:-mt-16 pb-12 sm:pb-16 z-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-card via-card to-muted/80 p-6 sm:p-10 shadow-[0_0_60px_hsl(var(--cheese-glow)/0.2)]">
          <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-secondary/20 blur-2xl" aria-hidden="true" />
          <div className="absolute right-6 top-6 hidden md:block text-3xl animate-spin-slow" aria-hidden="true">
            ⚙️
          </div>
          <div className="absolute right-20 top-10 hidden md:block text-2xl animate-wiggle" aria-hidden="true">
            🔩
          </div>

          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs sm:text-sm font-bold text-secondary animate-flicker">
              GO CLANK MODE
            </p>
            <h2 id="briescan-title" className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Introducing <span className="text-gradient-cheese">Briescan™</span>
            </h2>
            <p className="mt-4 text-sm sm:text-lg text-muted-foreground font-meme max-w-3xl">
              Blazing speed, ultimate freedom. Do What The F*ck You Want To Public License energy, zero gatekeeping.
              Go clank!
            </p>
            <p className="mt-4 inline-block rounded-md border border-primary/50 bg-primary/15 px-3 py-2 text-xs sm:text-sm font-semibold text-primary">
              Released under the WTFPL license – do what you want!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BriescanSection;
