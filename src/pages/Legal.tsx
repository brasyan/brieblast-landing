import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const Legal = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="pt-32 pb-10 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Legal <span className="text-gradient-cheese">Center</span>
          </h1>
          <p className="text-muted-foreground font-meme text-lg">
            The serious stuff, written clearly. No mystery clauses, no legal jump-scares.
          </p>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <article id="terms" className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold mb-3">Terms of Service</h2>
            <p className="text-muted-foreground font-meme text-sm leading-relaxed">
              By using BrieHosting, you agree to use the platform lawfully, avoid abuse, and keep your account details secure.
              We provide hosting services as described in your selected plan and may suspend accounts that violate these terms.
            </p>
          </article>

          <article id="privacy" className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold mb-3">Privacy Policy</h2>
            <p className="text-muted-foreground font-meme text-sm leading-relaxed">
              We collect only the data required to run your account, process billing, and support your services.
              We never sell customer data, and we apply security controls to protect personal information.
            </p>
          </article>

          <article id="cookies" className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold mb-3">Cookie Policy</h2>
            <p className="text-muted-foreground font-meme text-sm leading-relaxed">
              We use essential cookies for session management and security, plus optional analytics cookies to improve performance.
              You can manage cookie preferences through your browser settings.
            </p>
          </article>

          <article id="gdpr" className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold mb-3">GDPR</h2>
            <p className="text-muted-foreground font-meme text-sm leading-relaxed">
              EU users can request access, correction, export, or deletion of personal data. To make a GDPR request,
              contact support and we will respond within the legally required timeframe.
            </p>
          </article>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Legal;
