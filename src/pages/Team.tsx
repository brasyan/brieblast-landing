import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const teamMembers = [
  {
    emoji: "🧀",
    name: "Lakke",
    role: "Chief Cheese Officer",
    glowClass: "",
    badge: null,
  },
  {
    emoji: "🔪",
    name: "Sicario",
    role: "Head of Sharp Cheddar Operations",
    glowClass: "",
    badge: null,
  },
  {
    emoji: "⭐",
    name: "Laura",
    role: "Full-Stack Fromage Engineer",
    glowClass: "glow-cheese",
    badge: "Super Woman 🦸‍♀️",
  },
  {
    emoji: "🫕",
    name: "Anmoldeep",
    role: "Lead Fondue Engineer",
    glowClass: "",
    badge: null,
  },
  {
    emoji: "🏔️",
    name: "Sander",
    role: "Alpine Cheese Infrastructure Lead",
    glowClass: "",
    badge: null,
  },
  {
    emoji: "🌙",
    name: "Ylias",
    role: "Midnight Raclette DevOps Wizard",
    glowClass: "",
    badge: null,
  },
];

const Team = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">Meet the Team</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The Brains Behind the{" "}
            <span className="text-gradient-cheese">Cheese</span> 🧀
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-meme max-w-xl mx-auto">
            Six legends. One mission. Keep the cheese flowing and the servers cheesing.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-24 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className={`rounded-2xl border border-border bg-card p-8 card-hover flex flex-col items-center text-center gap-4 ${member.glowClass}`}
            >
              <span className="text-6xl">{member.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{member.name}</h2>
                {member.badge && (
                  <span className="inline-block mt-1 mb-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                    {member.badge}
                  </span>
                )}
                <p className="font-meme text-muted-foreground text-sm mt-1">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Team;
