import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const ResponsibleDisclosurePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-foreground">
        <h1 className="text-4xl font-bold mb-2">Responsible Disclosure</h1>
        <p className="text-muted-foreground text-sm mb-8">Security vulnerability reporting policy</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Overview</h2>
            <p>
              At BrieHosting.be we take the security of our platform and our customers' data seriously. If you have
              discovered a security vulnerability in our systems or services, we encourage you to report it to us
              responsibly. We appreciate the efforts of security researchers and will work with you to address any
              valid findings promptly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">How to Report</h2>
            <p>
              Please send a detailed report to{" "}
              <a href="mailto:security@briehosting.be" className="text-primary hover:underline font-semibold">
                security@briehosting.be
              </a>
              . Include as much information as possible to help us reproduce and verify the issue.
            </p>
            <p className="mt-3">Your report should include:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>A clear description of the vulnerability</li>
              <li>The affected URL, endpoint, or component</li>
              <li>Step-by-step reproduction instructions</li>
              <li>Potential impact and severity assessment</li>
              <li>Any proof-of-concept (PoC) code or screenshots (if applicable)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">What We Ask of You</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Do not exploit the vulnerability beyond what is strictly necessary to demonstrate the issue</li>
              <li>Do not access, modify, or delete data belonging to other users</li>
              <li>Do not perform denial-of-service attacks or disrupt our services</li>
              <li>Do not publicly disclose the vulnerability before we have had a reasonable opportunity to fix it</li>
              <li>Act in good faith and with the intention of improving security</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Our Commitments</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We will acknowledge receipt of your report within 3 business days</li>
              <li>We will investigate and keep you informed of our progress</li>
              <li>We will work to resolve confirmed vulnerabilities within a reasonable timeframe</li>
              <li>We will not pursue legal action against researchers who follow this policy in good faith</li>
              <li>With your permission, we may publicly acknowledge your contribution after the issue is resolved</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Scope</h2>
            <p>This policy applies to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>briehosting.be and all subdomains</li>
              <li>The BrieHosting customer portal and API</li>
              <li>Our hosting control panel infrastructure</li>
            </ul>
            <p className="mt-3">
              Issues relating to third-party services we use (e.g., payment providers, DNS registrars) are out of
              scope. Please report those directly to the respective providers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Contact</h2>
            <p>
              For all security-related communications, please email{" "}
              <a href="mailto:security@briehosting.be" className="text-primary hover:underline font-semibold">
                security@briehosting.be
              </a>
              . We recommend encrypting sensitive reports — please request our PGP key in your initial email.
            </p>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default ResponsibleDisclosurePage;
