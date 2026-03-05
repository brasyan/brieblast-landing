import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const interns = [
  {
    emoji: "🤖",
    name: "Model A",
    role: "Meme Generation Specialist",
    task: "Generates memes and jokes to keep the cheese culture alive.",
  },
  {
    emoji: "💬",
    name: "Model B",
    role: "Conversation & Banter Intern",
    task: "Assists with conversations and banter so you never eat cheese alone.",
  },
  {
    emoji: "🎨",
    name: "Model C",
    role: "Silly Animation Engineer",
    task: "Creates silly animations that make even the hardest cheese melt.",
  },
];

const Interns = () => {
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
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">Behind the Scenes</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Meet Our{" "}
            <span className="text-gradient-cheese">AI Interns</span> 🤖
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-meme max-w-xl mx-auto">
            Unpaid, untamed, and powered by electricity. Our AI interns keep BrieHosting weird and wonderful.
          </p>
        </div>
      </section>

      {/* Interns Grid */}
      <section className="py-24 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {interns.map((intern) => (
            <div
              key={intern.name}
              className="rounded-2xl border border-border bg-card p-8 card-hover flex flex-col items-center text-center gap-4"
            >
              <span className="text-6xl">{intern.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{intern.name}</h2>
                <p className="font-meme text-primary text-xs font-bold mt-1 mb-2">{intern.role}</p>
                <p className="font-meme text-muted-foreground text-sm">{intern.task}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Interns;