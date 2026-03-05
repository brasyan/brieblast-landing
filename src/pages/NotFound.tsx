import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const incidentLog = [
  { time: "10:42", author: "Kevin (Intern)", message: "hey so i pushed to prod" },
  { time: "10:42", author: "Kevin (Intern)", message: "i thought rm -rf only deleted the bad files" },
  { time: "10:43", author: "Kevin (Intern)", message: "the cheese is also gone" },
  { time: "10:43", author: "Kevin (Intern)", message: "i can explain" },
  { time: "10:44", author: "Kevin (Intern)", message: "actually no i cannot" },
  { time: "10:44", author: "Lakke (CEO)", message: "KEVIN" },
  { time: "10:44", author: "Kevin (Intern)", message: "im already in the car" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-primary/3 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="animate-pulse-glow inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-meme tracking-wide">
              🧀 definitely not our fault 🧀
            </span>
          </div>

          {/* Floating cheese */}
          <div className="text-7xl mb-4 animate-float select-none">🧀</div>

          {/* Giant 404 */}
          <h1 className="text-8xl md:text-[10rem] font-bold leading-none mb-4 text-gradient-cheese glow-cheese">
            4🧀4
          </h1>

          {/* Subheading */}
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            This page got yeeted into the void
          </p>
          <p className="text-muted-foreground text-lg font-meme max-w-xl mx-auto mb-12">
            Our intern deleted it. We're handling it internally.{" "}
            <span className="text-primary">(He's fine. The cheese is not.)</span>
          </p>

          {/* Incident Report Card */}
          <div className="card-hover max-w-2xl mx-auto mb-12 rounded-xl border-l-4 border-secondary border-t border-r border-b border-border bg-card text-left overflow-hidden glow-cheese">
            <div className="px-6 py-4 border-b border-border bg-muted/40">
              <p className="font-mono text-sm font-bold text-foreground tracking-wide">
                📋 INTERNAL INCIDENT REPORT — #INC-404
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="font-mono text-xs text-muted-foreground mb-4 border-b border-border/50 pb-2">
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              </div>
              <ul className="space-y-2">
                {incidentLog.map((entry, i) => (
                  <li key={i} className="font-mono text-sm flex gap-3">
                    <span className="text-muted-foreground shrink-0">[{entry.time}]</span>
                    <span className={entry.author === "Lakke (CEO)" ? "text-secondary font-bold" : "text-foreground"}>
                      <span className="text-primary">{entry.author}:</span>{" "}
                      {entry.message}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="font-mono text-xs text-muted-foreground mt-4 border-t border-border/50 pt-2">
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              </div>
              <p className="font-mono text-sm text-accent mt-3">
                Status: Kevin has been reassigned to waffle duty 🧇
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/"
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:scale-105 transition-transform glow-cheese card-hover"
            >
              Take me home 🏠
            </Link>
            <Link
              to="/status"
              className="px-8 py-4 rounded-xl border border-border bg-card text-foreground font-bold text-lg hover:scale-105 transition-transform card-hover"
            >
              See our status page 📡
            </Link>
          </div>

          {/* Footer line */}
          <p className="text-xs text-muted-foreground font-meme">
            © 2026 BrieHosting.be — No interns were permanently harmed. The cheese though... 🧀
          </p>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default NotFound;
