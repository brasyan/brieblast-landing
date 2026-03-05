import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy • BrieHosting.be";
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
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">Your Data, Your Rights</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Privacy <span className="text-gradient-cheese">Policy</span> 🔐
          </h1>
          <p className="text-muted-foreground text-lg font-meme max-w-xl mx-auto">
            We don't sell your data for a wheel of brie. Your privacy is worth more than that. At least two wheels.
          </p>
          <p className="text-xs text-muted-foreground font-meme mt-4">Last updated: 2026-03-05</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Callout */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 px-6 py-5 glow-cheese">
            <p className="text-sm font-meme text-primary font-bold mb-1">🧀 The short version</p>
            <p className="text-sm text-muted-foreground font-meme">
              We collect only what we need, we protect it properly, and we never sell it. GDPR-compliant because we're Belgian and we literally have no choice — and also because it's the right thing to do.
            </p>
          </div>

          {/* Section 1 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Who We Are</h2>
            <p className="text-muted-foreground font-meme leading-relaxed">
              BrieHosting.be is a web hosting provider based in Belgium. We are the data controller for personal data collected through our website and services. If you have any questions about how we handle your data, our Data Protection Officer can be reached at <span className="text-primary">privacy@briehosting.be</span>. They love hearing from people who actually read privacy policies.
            </p>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Data We Collect</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-4">
              We collect the minimum data needed to provide and improve our services. Here's what that looks like:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-foreground mb-2">Account & Billing Data</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-meme text-sm">
                  <li>Name and email address (to identify you and send important account notifications)</li>
                  <li>Billing address and payment method details (processed securely via our payment provider — we never store full card numbers)</li>
                  <li>Company name and VAT number where applicable</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Technical & Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-meme text-sm">
                  <li>IP address and browser/device information (for security and abuse prevention)</li>
                  <li>Pages visited and features used (anonymous analytics to improve the service)</li>
                  <li>Server logs retained for up to 90 days</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Support Data</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-meme text-sm">
                  <li>Ticket content and conversation history when you contact support</li>
                  <li>Information you voluntarily provide while troubleshooting issues</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Data</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-4">
              Your data is used exclusively for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-meme text-sm">
              <li><strong className="text-foreground">Service delivery:</strong> Provisioning, managing, and maintaining your hosting services</li>
              <li><strong className="text-foreground">Billing:</strong> Processing payments, issuing invoices, and managing subscriptions</li>
              <li><strong className="text-foreground">Support:</strong> Responding to your tickets and resolving technical issues</li>
              <li><strong className="text-foreground">Security:</strong> Detecting and preventing fraud, abuse, and unauthorised access</li>
              <li><strong className="text-foreground">Legal compliance:</strong> Meeting our obligations under Belgian and EU law</li>
              <li><strong className="text-foreground">Service improvement:</strong> Analysing aggregated, anonymised usage patterns to make BrieHosting better</li>
            </ul>
            <p className="text-muted-foreground font-meme leading-relaxed mt-4 text-sm">
              We do <strong className="text-foreground">not</strong> sell, rent, or trade your personal data to third parties. Not even for a really nice Comté.
            </p>
          </div>

          {/* Section 4 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-4">
              We share data only with trusted sub-processors who are contractually obligated to protect it:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-meme text-sm">
              <li>Payment processors (for billing — they handle the €€€, not us)</li>
              <li>Email delivery providers (for transactional emails like invoices and password resets)</li>
              <li>Infrastructure partners operating within the EU</li>
            </ul>
            <p className="text-muted-foreground font-meme leading-relaxed mt-4 text-sm">
              We never transfer your data outside the European Economic Area without appropriate safeguards in place.
            </p>
          </div>

          {/* Section 5 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground font-meme leading-relaxed">
              We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we retain data for up to 6 months for legal and security purposes, then permanently delete it. Billing records are retained for 7 years as required by Belgian tax law. Yes, seven years — blame the tax authorities, not us.
            </p>
          </div>

          {/* Section 6 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights (GDPR)</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-4">
              As a resident of the EU/EEA, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-meme text-sm">
              <li><strong className="text-foreground">Right of access:</strong> Request a copy of the data we hold about you</li>
              <li><strong className="text-foreground">Right to rectification:</strong> Correct any inaccurate or incomplete data</li>
              <li><strong className="text-foreground">Right to erasure:</strong> Request deletion of your data (the "right to be forgotten")</li>
              <li><strong className="text-foreground">Right to restriction:</strong> Limit how we process your data in certain circumstances</li>
              <li><strong className="text-foreground">Right to portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong className="text-foreground">Right to object:</strong> Object to processing based on legitimate interests or direct marketing</li>
            </ul>
            <p className="text-muted-foreground font-meme leading-relaxed mt-4 text-sm">
              To exercise any of these rights, email <span className="text-primary">privacy@briehosting.be</span>. We'll respond within 30 days. You can also lodge a complaint with the Belgian Data Protection Authority (APD/GBA) at <span className="text-primary">www.dataprotectionauthority.be</span>.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-secondary/30 bg-secondary/5 px-6 py-5">
            <p className="text-sm font-bold text-foreground mb-1">📬 Privacy questions?</p>
            <p className="text-sm text-muted-foreground font-meme">
              Contact our Data Protection Officer at <span className="text-primary">privacy@briehosting.be</span>. We take your privacy as seriously as we take our cheese selection.
            </p>
          </div>

        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Privacy;
