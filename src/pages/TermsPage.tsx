import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-foreground">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: March 2026</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using any services provided by BrieHosting.be ("BrieHosting", "we", "us", or "our"), you
              agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our
              services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Description of Services</h2>
            <p>
              BrieHosting.be provides web hosting, domain registration, and related services. We reserve the right to
              modify, suspend, or discontinue any service at any time with reasonable notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">3. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account. You agree to notify us immediately of any unauthorised use of your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">4. Acceptable Use</h2>
            <p>You agree not to use our services to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Host or distribute illegal content</li>
              <li>Send unsolicited bulk email (spam)</li>
              <li>Conduct denial-of-service attacks or any other malicious network activity</li>
              <li>Infringe the intellectual property rights of others</li>
              <li>Violate any applicable local, national, or international law</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">5. Payment and Billing</h2>
            <p>
              Subscription fees are billed in advance on a monthly or annual basis depending on your chosen plan. All
              fees are non-refundable unless otherwise required by law. We reserve the right to change our pricing with
              30 days' notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">6. Uptime and Service Levels</h2>
            <p>
              We strive to maintain high availability for all services. Scheduled maintenance will be announced in
              advance. We are not liable for downtime caused by factors outside our control, including force majeure
              events or third-party infrastructure failures.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, BrieHosting.be shall not be liable for any indirect, incidental,
              special, or consequential damages arising out of your use of our services. Our total liability shall not
              exceed the amount you paid us in the three months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account for violation of these terms. You may cancel
              your account at any time from your dashboard. Upon termination, your data may be deleted after a
              reasonable grace period.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">9. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of Belgium. Any disputes shall be
              subject to the exclusive jurisdiction of the courts of Belgium.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">10. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:hello@briehosting.be" className="text-primary hover:underline">
                hello@briehosting.be
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default TermsPage;
