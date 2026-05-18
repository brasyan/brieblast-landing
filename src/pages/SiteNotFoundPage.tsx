import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const SiteNotFoundPage = () => {
  const location = useLocation();

  const siteName = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const site = params.get("site")?.trim();
    return site && site.length > 0 ? site : "unknown-site.briehosting.be";
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="pt-28 pb-16 px-4">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card/50 max-w-4xl mx-auto p-8 md:p-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 left-10 w-52 h-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-6 right-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative text-center">
            <p className="text-sm font-meme text-primary uppercase tracking-widest mb-4">
              Site not found
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              We couldn’t find this <span className="text-gradient-cheese">website</span> 🧀
            </h1>
            <p className="text-muted-foreground font-meme text-lg max-w-2xl mx-auto mb-8">
              The requested site does not exist in our hosting registry or is no longer available.
            </p>

            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-background/80 p-4 md:p-5 text-left">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Requested website</p>
              <p className="font-mono text-sm md:text-base text-primary break-all">{siteName}</p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
              >
                Back to Home
              </Link>
              <a
                href="mailto:support@briehosting.be"
                className="px-6 py-3 rounded-lg border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

export default SiteNotFoundPage;
