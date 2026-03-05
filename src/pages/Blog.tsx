import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const posts = [
  {
    emoji: "🧀",
    tag: "Engineering",
    date: "2026-02-28",
    title: "Why We Store All Our Servers in a Cave (No, Really)",
    excerpt:
      "Belgian cheese caves maintain a perfect 12°C year-round. Turns out that's also ideal for server cooling. Our SRE team has never been happier — or smellier.",
    readTime: "4 min read",
    glowClass: "glow-cheese",
  },
  {
    emoji: "⚡",
    tag: "Performance",
    date: "2026-02-14",
    title: "We Got 99.9% Uptime and a Waffle Didn't Cause It",
    excerpt:
      "A deep dive into how BrieHosting achieved our SLA in 2025 despite one intern, two power outages, and a waffle iron incident that we are legally not allowed to describe in full.",
    readTime: "6 min read",
    glowClass: "glow-pink",
  },
  {
    emoji: "🔐",
    tag: "Security",
    date: "2026-01-30",
    title: "SSL Everywhere: Because Hosting Without It Is Basically Crime",
    excerpt:
      "We auto-provision SSL for every domain on our platform. Here's the technical story behind how we did it and why your old HTTP site should be ashamed of itself.",
    readTime: "5 min read",
    glowClass: "glow-cyan",
  },
  {
    emoji: "🚀",
    tag: "Product",
    date: "2026-01-15",
    title: "Introducing Instant Deploys: Push, Blink, Done",
    excerpt:
      "We rewrote our deploy pipeline from scratch. It now takes less time to go from `git push` to live than it does to slice a baguette. Benchmarks included.",
    readTime: "7 min read",
    glowClass: "glow-cheese",
  },
  {
    emoji: "🧇",
    tag: "Culture",
    date: "2025-12-20",
    title: "Meet the Team: Waffles, Cheese, and One Very Tired Intern",
    excerpt:
      "We sat down (virtually — we're a remote-first team) with the people behind BrieHosting. Topics covered: favourite cheeses, worst deploy stories, and Kevin's future in IT.",
    readTime: "3 min read",
    glowClass: "glow-pink",
  },
  {
    emoji: "📊",
    tag: "Infrastructure",
    date: "2025-12-05",
    title: "How We Handle 10,000 Concurrent Connections Without Breaking a Sweat",
    excerpt:
      "Load balancing, connection pooling, and a healthy respect for back-pressure. A no-nonsense look at the infrastructure stack powering BrieHosting's network layer.",
    readTime: "8 min read",
    glowClass: "glow-cyan",
  },
];

const Blog = () => {
  useEffect(() => {
    document.title = "Blog • BrieHosting.be";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">From the Cheese Cave</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The <span className="text-gradient-cheese">BrieHosting</span> Blog 📝
          </h1>
          <p className="text-muted-foreground text-lg font-meme max-w-xl mx-auto">
            Engineering deep-dives, product updates, and the occasional tale of intern-related catastrophe. All aged to perfection.
          </p>
        </div>
      </section>

      {/* Featured post */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-primary/30 bg-card p-8 glow-cheese card-hover cursor-default">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{posts[0].emoji}</span>
              <span className="px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-meme tracking-wide">
                ⭐ Featured — {posts[0].tag}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-meme mb-2">{posts[0].date} · {posts[0].readTime}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{posts[0].title}</h2>
            <p className="text-muted-foreground font-meme leading-relaxed">{posts[0].excerpt}</p>
            <p className="text-primary font-meme text-sm mt-4 font-bold">Read more → (coming soon™)</p>
          </div>
        </div>
      </section>

      {/* Post grid */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Recent Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.slice(1).map((post, i) => (
              <div
                key={i}
                className={`card-hover rounded-2xl border border-border bg-card p-6 cursor-default ${post.glowClass}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{post.emoji}</span>
                  <span className="px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-meme">
                    {post.tag}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-meme mb-2">{post.date} · {post.readTime}</p>
                <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">{post.title}</h3>
                <p className="text-muted-foreground font-meme text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                <p className="text-primary font-meme text-xs mt-3 font-bold">Read more → (coming soon™)</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-border bg-card p-8 glow-cheese">
            <p className="text-3xl mb-4">🧀</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Stay in the <span className="text-gradient-cheese">Loop</span>
            </h2>
            <p className="text-muted-foreground font-meme mb-6 text-sm">
              Subscribe to get new posts delivered straight to your inbox. No spam. No third-party sharing. Just cheese-scented hosting content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground font-meme text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform glow-cheese">
                Subscribe 🧀
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-meme mt-3">
              We'll only email you when there's something worth reading. Promise.
            </p>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Blog;
