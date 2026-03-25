import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-foreground">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: March 2026</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Introduction</h2>
            <p>
              BrieHosting.be ("BrieHosting", "we", "us", or "our") is committed to protecting your personal data. This
              Privacy Policy explains what information we collect, how we use it, and your rights under the General Data
              Protection Regulation (GDPR) and applicable Belgian privacy law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Data We Collect</h2>
            <p>We may collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong className="text-foreground">Account information</strong> — name, email address, and password
                (stored securely hashed)
              </li>
              <li>
                <strong className="text-foreground">Billing information</strong> — payment method details processed by
                our payment provider
              </li>
              <li>
                <strong className="text-foreground">Usage data</strong> — server logs, IP addresses, browser type, and
                pages visited
              </li>
              <li>
                <strong className="text-foreground">Communication data</strong> — emails or support tickets you send us
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">3. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide, operate, and maintain our hosting services</li>
              <li>Process payments and send billing notifications</li>
              <li>Respond to support requests and communicate service updates</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">4. Legal Basis for Processing</h2>
            <p>
              We process your personal data on the following legal bases: performance of a contract (Art. 6(1)(b)
              GDPR), compliance with a legal obligation (Art. 6(1)(c) GDPR), and our legitimate interests in operating
              a secure and reliable service (Art. 6(1)(f) GDPR).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">5. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide our services.
              After account termination, data is deleted within 90 days unless we are required to retain it for legal
              or regulatory purposes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">6. Cookies</h2>
            <p>
              We use strictly necessary cookies to keep you logged in and to ensure the security of our platform. We do
              not use third-party tracking or advertising cookies. By using our service, you consent to the use of
              these essential cookies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">7. Third-Party Processors</h2>
            <p>
              We share data with trusted third parties only to the extent necessary to operate our services (e.g.,
              payment processors, infrastructure providers). All processors are bound by GDPR-compliant data processing
              agreements.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">8. Your Rights (GDPR)</h2>
            <p>Under the GDPR you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request erasure ("right to be forgotten")</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Lodge a complaint with the Belgian Data Protection Authority (GBA/APD)</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@briehosting.be" className="text-primary hover:underline">
                privacy@briehosting.be
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">9. Contact</h2>
            <p>
              For privacy-related questions, please contact us at{" "}
              <a href="mailto:privacy@briehosting.be" className="text-primary hover:underline">
                privacy@briehosting.be
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

export default PrivacyPage;
