import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const blogPosts = [
  {
    title: "How To Pick The Right Hosting Plan",
    slug: "hosting-plan-guide",
    excerpt: "A quick, no-fluff guide to choosing between Smol Brie, Thicc Brie, and Mega Brie.",
  },
  {
    title: "Uptime Myths (And What Actually Matters)",
    slug: "uptime-myths",
    excerpt: "99.9%, 99.99%, SLAs, and what those numbers mean for your real users.",
  },
  {
    title: "Deploy Faster With Less Panic",
    slug: "deploy-faster",
    excerpt: "Simple release habits that reduce downtime and production stress.",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">BrieHosting Blog</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fresh Hosting Reads <span className="text-gradient-cheese">Every Week</span>
          </h1>
          <p className="text-muted-foreground text-lg font-meme">
            Tips, explainers, and launch stories from the team behind the cheese-powered servers.
          </p>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto grid gap-5">
          {blogPosts.map((post) => (
            <article key={post.slug} className="rounded-xl border border-border bg-card p-6 card-hover">
              <h2 className="text-2xl font-bold text-foreground mb-2">{post.title}</h2>
              <p className="text-muted-foreground font-meme text-sm">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Blog;
