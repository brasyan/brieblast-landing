import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const Terms = () => {
  useEffect(() => {
    document.title = "Terms of Service • BrieHosting.be";
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
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">The Boring (But Important) Stuff</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Terms of <span className="text-gradient-cheese">Service</span> 📜
          </h1>
          <p className="text-muted-foreground text-lg font-meme max-w-xl mx-auto">
            We promise to keep it real. No cheese was traded, sold, or gifted in exchange for hiding anything sketchy in here.
          </p>
          <p className="text-xs text-muted-foreground font-meme mt-4">Last updated: 2026-03-05</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Callout */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 px-6 py-5 glow-cheese">
            <p className="text-sm font-meme text-primary font-bold mb-1">🧀 Friendly reminder</p>
            <p className="text-sm text-muted-foreground font-meme">
              By using BrieHosting.be you agree to these terms. No cheese was harmed in the writing of this document, but a significant amount was consumed.
            </p>
          </div>

          {/* Section 1 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-3">
              By accessing or using BrieHosting.be ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
            <p className="text-muted-foreground font-meme leading-relaxed">
              These terms apply to all visitors, users, customers, and others who access the Service. Yes, even you, Kevin.
            </p>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-3">
              BrieHosting.be provides web hosting, domain management, SSL certificates, and related services. We operate from Belgium, a country renowned for waffles, chocolate, and now apparently world-class hosting.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-meme text-sm">
              <li>Shared hosting, VPS, and dedicated server plans</li>
              <li>99.9% uptime SLA (the 0.1% is when Kevin trips over the server cable)</li>
              <li>Free SSL certificates on all plans</li>
              <li>Daily automated backups</li>
              <li>24/7 technical support via ticket, chat, and carrier pigeon (carrier pigeon subject to availability)</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Billing & Payments</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-3">
              All fees are billed in Euros (€) and are due in advance. By providing payment information you authorize us to charge your payment method for all fees incurred.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-meme text-sm">
              <li>Monthly and annual billing cycles are available. Annual plans come with a discount and our eternal gratitude.</li>
              <li>Invoices are issued at the start of each billing period.</li>
              <li>Failure to pay within 14 days may result in service suspension. We'll send reminders — we're not monsters.</li>
              <li>Refunds are available within 30 days of your initial purchase if you're not satisfied. No questions asked, though we might cry a little.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Prohibited Use</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-4">
              You may not use BrieHosting.be for any unlawful purpose or in violation of these Terms. The following are expressly prohibited:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-meme text-sm">
              <li>Hosting illegal content of any kind</li>
              <li>Sending unsolicited bulk email (spam). We hate spam. Spam is not cheese.</li>
              <li>Conducting DDoS attacks or any form of network abuse</li>
              <li>Mining cryptocurrency in a manner that degrades service for other customers</li>
              <li>Impersonating BrieHosting.be or its staff (our support team is irreplaceable)</li>
              <li>Attempting to gain unauthorised access to our systems or other customers' data</li>
            </ul>
            <p className="text-muted-foreground font-meme leading-relaxed mt-4 text-sm">
              Violation of these rules may result in immediate account suspension without refund. Seriously.
            </p>
          </div>

          {/* Section 5 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Limitation of Liability</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-3">
              BrieHosting.be shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses.
            </p>
            <p className="text-muted-foreground font-meme leading-relaxed">
              Our maximum liability to you for any claim arising out of or relating to these Terms or our services shall not exceed the amount you paid us in the 12 months preceding the claim. We're a hosting company, not an insurance policy — though our uptime is pretty solid.
            </p>
          </div>

          {/* Section 6 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Changes to Terms</h2>
            <p className="text-muted-foreground font-meme leading-relaxed">
              We reserve the right to update these Terms at any time. We will notify you of significant changes via email or a prominent notice on our website at least 30 days before the change takes effect. Continued use of the Service after changes constitutes acceptance of the new Terms. We promise not to sneak anything cheesy past you. Well, only the good kind of cheesy.
            </p>
          </div>

          {/* Section 7 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Governing Law</h2>
            <p className="text-muted-foreground font-meme leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Belgium, without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts of Belgium. As it should be — Belgium has great courts AND great cheese.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-secondary/30 bg-secondary/5 px-6 py-5">
            <p className="text-sm font-bold text-foreground mb-1">📬 Questions?</p>
            <p className="text-sm text-muted-foreground font-meme">
              If you have any questions about these Terms, please contact us at <span className="text-primary">legal@briehosting.be</span>. We read every email. Yes, even the weird ones.
            </p>
          </div>

        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Terms;
