import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const CHEESE_FACTS = [
  "Brie cheese was first made in the 8th century. Your page is younger than that and still vanished.",
  "A wheel of aged Parmesan costs around €500. This page? Priceless. Because it doesn't exist.",
  "The word 'cheese' appears 0 times on this page, except right now. Twice. Three times.",
  "Scientists have confirmed: 404 pages smell faintly of Gouda. Do you smell it?",
  "In 1520, a French monk accidentally invented Brie while trying to hide from tax collectors. You cannot hide from this 404.",
  "The average human produces enough saliva in a lifetime to fill two swimming pools. None of that helps you find this page.",
];

const NotFound = () => {
  const location = useLocation();
  const [factIndex, setFactIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((i) => (i + 1) % CHEESE_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-center">

      {/* Radial glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(45 100% 60% / 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 70% 70%, hsl(320 80% 55% / 0.06) 0%, transparent 60%)",
        }}
      />

      {/* Orbiting cheese emojis */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute animate-orbit text-4xl" style={{ animationDelay: "0s" }}>🧀</span>
        <span className="absolute animate-orbit text-2xl" style={{ animationDelay: "-3.5s" }}>🫕</span>
        <span className="absolute animate-orbit-reverse text-3xl" style={{ animationDelay: "0s" }}>🍕</span>
        <span className="absolute animate-orbit-reverse text-xl" style={{ animationDelay: "-5.5s" }}>🐀</span>
      </div>

      {/* Floating background emoji clutter */}
      <span className="pointer-events-none absolute left-[8%] top-[12%] animate-float text-5xl opacity-20" style={{ animationDelay: "0s" }}>🧀</span>
      <span className="pointer-events-none absolute right-[6%] top-[18%] animate-float text-4xl opacity-15" style={{ animationDelay: "-2s" }}>🧀</span>
      <span className="pointer-events-none absolute left-[15%] bottom-[20%] animate-float text-3xl opacity-20" style={{ animationDelay: "-4s" }}>🫕</span>
      <span className="pointer-events-none absolute right-[10%] bottom-[15%] animate-float text-5xl opacity-15" style={{ animationDelay: "-1s" }}>🍕</span>
      <span className="pointer-events-none absolute left-[3%] top-[50%] animate-float text-2xl opacity-25" style={{ animationDelay: "-3s" }}>🐀</span>
      <span className="pointer-events-none absolute right-[3%] top-[55%] animate-float text-2xl opacity-20" style={{ animationDelay: "-5s" }}>🧀</span>
      <span className="pointer-events-none absolute left-[45%] top-[5%] animate-float text-3xl opacity-10" style={{ animationDelay: "-1.5s" }}>🫕</span>
      <span className="pointer-events-none absolute left-[30%] bottom-[5%] animate-float text-4xl opacity-15" style={{ animationDelay: "-2.5s" }}>🧀</span>
      <span className="pointer-events-none absolute right-[28%] bottom-[8%] animate-float text-3xl opacity-10" style={{ animationDelay: "-0.5s" }}>🍕</span>

      {/* Main content */}
      <div className="relative z-10 max-w-3xl">

        {/* Big spinning cheese */}
        <div className="mb-4 flex justify-center">
          <span className="animate-spin-slow inline-block text-8xl md:text-9xl drop-shadow-[0_0_40px_hsl(45_100%_60%/0.6)]">🧀</span>
        </div>

        {/* 404 heading */}
        <h1
          className="animate-drop-in animate-glitch mb-2 font-bold leading-none"
          style={{ fontSize: "clamp(6rem, 22vw, 16rem)", lineHeight: 1 }}
        >
          <span className="text-gradient-cheese">404</span>
        </h1>

        {/* Drama subtitle */}
        <p className="animate-flicker mb-2 font-meme text-2xl md:text-4xl font-bold text-secondary">
          🚨 CRITICAL CHEESE FAILURE 🚨
        </p>

        <p className="mb-1 font-meme text-lg md:text-2xl text-primary animate-wiggle inline-block">
          THE PAGE HAS MELTED INTO THE VOID
        </p>

        {/* "Technical" error block */}
        <div className="mx-auto mt-6 mb-6 max-w-xl rounded-xl border border-border bg-card p-4 text-left font-mono text-xs md:text-sm glow-cheese">
          <p className="text-neon-green mb-1">$ brie-debug --path "{location.pathname}"</p>
          <p className="text-muted-foreground">&gt; Scanning cheese registry... <span className="text-destructive font-bold">FAILED</span></p>
          <p className="text-muted-foreground">&gt; Attempting emergency Gouda fallback... <span className="text-destructive font-bold">FAILED</span></p>
          <p className="text-muted-foreground">&gt; Consulting the ancient Parmesan scrolls... <span className="text-destructive font-bold">FAILED</span></p>
          <p className="text-muted-foreground">&gt; Asking the cheese rats for help... <span className="text-yellow-400 font-bold">SQUEAKING</span></p>
          <p className="text-primary mt-2 animate-pulse">
            ERROR_CODE: FROMAGE_NOT_FOUND &nbsp;|&nbsp; PAGE_GONE: true &nbsp;|&nbsp; DRAMA_LEVEL: maximum
          </p>
          <p className="text-muted-foreground mt-1">Time wasted on this page: <span className="text-primary font-bold">{elapsed}s</span> (and counting)</p>
        </div>

        {/* Rotating cheese fact */}
        <div className="mx-auto mb-6 max-w-lg rounded-full border border-primary/30 bg-primary/10 px-6 py-3 animate-pulse-glow">
          <p className="font-meme text-sm text-primary">
            🧀 <span className="font-bold">Cheese Fact #{factIndex + 1}:</span> {CHEESE_FACTS[factIndex]}
          </p>
        </div>

        {/* Dramatic explanation */}
        <p className="mb-3 text-muted-foreground font-meme text-lg">
          The page at <code className="rounded bg-muted px-2 py-0.5 text-primary">{location.pathname}</code> does not exist,
          never existed, and will <em>probably</em> never exist.
        </p>
        <p className="mb-8 text-muted-foreground font-meme">
          Our team of highly trained cheese professionals has been notified. They are currently weeping into their fondue.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg glow-cheese hover:scale-110 transition-transform animate-pulse-glow"
          >
            🏠 Escape the Void
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 rounded-lg border border-secondary text-secondary font-bold text-lg hover:bg-secondary/10 transition-colors hover:scale-105"
          >
            ⬅️ Go Back (if you dare)
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 rounded-lg border border-accent text-accent font-bold text-lg hover:bg-accent/10 transition-colors hover:scale-105"
          >
            🔄 Try Again (it won't work)
          </button>
        </div>

        {/* Footer drama */}
        <p className="mt-10 text-xs text-muted-foreground font-meme opacity-60">
          BrieHosting is not responsible for lost pages, lost time, or lost cheese. All pages are provided as-is, or not at all. 🧀
        </p>
      </div>
    </div>
  );
};

export default NotFound;
