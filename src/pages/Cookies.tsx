import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const Cookies = () => {
  useEffect(() => {
    document.title = "Cookie Policy • BrieHosting.be";
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
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">Not the Chocolate Kind</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Cookie <span className="text-gradient-cheese">Policy</span> 🍪
          </h1>
          <p className="text-muted-foreground text-lg font-meme max-w-xl mx-auto">
            We use cookies. Not the kind you eat with brie (though that does sound amazing). The digital kind that help us run this site properly.
          </p>
          <p className="text-xs text-muted-foreground font-meme mt-4">Last updated: 2026-03-05</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Callout */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 px-6 py-5 glow-cheese">
            <p className="text-sm font-meme text-primary font-bold mb-1">🍪 Cookie notice</p>
            <p className="text-sm text-muted-foreground font-meme">
              By continuing to use BrieHosting.be you consent to our use of cookies as described below. You can manage your preferences at any time. We won't guilt-trip you about it. Much.
            </p>
          </div>

          {/* Section 1 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. What Are Cookies?</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-3">
              Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work more efficiently, remember your preferences, and provide basic analytics to site owners.
            </p>
            <p className="text-muted-foreground font-meme leading-relaxed">
              Unlike real cookies, digital cookies are calorie-free and cannot be enjoyed with a glass of Belgian beer. We consider this a significant design flaw of the internet, but here we are.
            </p>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Types of Cookies We Use</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-bold text-foreground mb-2">Strictly Necessary Cookies</h3>
                <p className="text-muted-foreground font-meme text-sm leading-relaxed mb-2">
                  These cookies are essential for the website to function and cannot be switched off. They are set in response to actions you take, such as setting your privacy preferences, logging in, or filling out forms.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-meme text-sm">
                  <li>Session authentication tokens (keeps you logged in)</li>
                  <li>CSRF protection tokens (keeps the bad guys out)</li>
                  <li>Cookie consent preferences (remembers your choice about cookies — very meta)</li>
                </ul>
                <p className="text-xs text-muted-foreground font-meme mt-2 italic">You cannot opt out of these. Sorry. Not sorry.</p>
              </div>

              <div className="border-l-4 border-secondary pl-4">
                <h3 className="font-bold text-foreground mb-2">Performance & Analytics Cookies</h3>
                <p className="text-muted-foreground font-meme text-sm leading-relaxed mb-2">
                  These cookies help us understand how visitors interact with our website by collecting information anonymously. This helps us improve the website and your experience on it.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-meme text-sm">
                  <li>Page view counts and popular content (anonymous)</li>
                  <li>Referral source tracking (how did you find us? Was it the cheese?)</li>
                  <li>Error tracking to catch bugs before our intern does</li>
                </ul>
                <p className="text-xs text-muted-foreground font-meme mt-2 italic">You can opt out of these. We'll miss you, statistically speaking.</p>
              </div>

              <div className="border-l-4 border-accent pl-4">
                <h3 className="font-bold text-foreground mb-2">Functional Cookies</h3>
                <p className="text-muted-foreground font-meme text-sm leading-relaxed mb-2">
                  These cookies enable enhanced functionality and personalisation. They may be set by us or by third-party providers whose services we use.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-meme text-sm">
                  <li>Theme/display preferences (dark mode, naturally)</li>
                  <li>Dashboard layout preferences</li>
                  <li>Language and regional settings</li>
                </ul>
                <p className="text-xs text-muted-foreground font-meme mt-2 italic">Opt out at your own risk. You might lose your dark mode settings and we will not apologise for the eye strain.</p>
              </div>

              <div className="border-l-4 border-muted-foreground pl-4">
                <h3 className="font-bold text-foreground mb-2">Marketing Cookies</h3>
                <p className="text-muted-foreground font-meme text-sm leading-relaxed">
                  We currently do not use marketing or advertising cookies. We figure if our cheese puns are funny enough, you'll come back on your own. We reserve the right to add these in the future, with your consent.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Cookie Retention</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-4">
              Cookies are retained for different periods depending on their type:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-bold text-foreground">Cookie Type</th>
                    <th className="text-left py-3 pr-4 font-bold text-foreground">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground font-meme">
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4">Session cookies</td>
                    <td className="py-3">Deleted when you close your browser</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4">Authentication cookies</td>
                    <td className="py-3">Up to 30 days (or until you log out)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4">Analytics cookies</td>
                    <td className="py-3">Up to 12 months</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Preference cookies</td>
                    <td className="py-3">Up to 12 months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Managing Your Cookie Preferences</h2>
            <p className="text-muted-foreground font-meme leading-relaxed mb-4">
              You have several options for managing cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-meme text-sm">
              <li><strong className="text-foreground">Browser settings:</strong> Most browsers allow you to block or delete cookies through their settings menu. Check your browser's help documentation for instructions.</li>
              <li><strong className="text-foreground">Our consent banner:</strong> When you first visit, you can choose which non-essential cookie categories to accept.</li>
              <li><strong className="text-foreground">Account settings:</strong> Logged-in users can manage preference cookies from their dashboard settings.</li>
            </ul>
            <p className="text-muted-foreground font-meme leading-relaxed mt-4 text-sm">
              Please note that blocking strictly necessary cookies will prevent BrieHosting.be from functioning properly. Some features may become unavailable, and we cannot guarantee the quality of your cheese-based hosting experience.
            </p>
          </div>

          {/* Section 5 */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Third-Party Cookies</h2>
            <p className="text-muted-foreground font-meme leading-relaxed">
              Some cookies on our site are set by third-party services we use (e.g., payment processors, analytics providers). These third parties have their own privacy and cookie policies, and we recommend reading them. We carefully vet any third-party services we use to ensure they meet our privacy standards. No shady vendors, no cheese under the table.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-secondary/30 bg-secondary/5 px-6 py-5">
            <p className="text-sm font-bold text-foreground mb-1">🍪 Cookie questions?</p>
            <p className="text-sm text-muted-foreground font-meme">
              Questions about our cookie usage? Email <span className="text-primary">privacy@briehosting.be</span>. We'll get back to you faster than you can dip a cookie in melted brie.
            </p>
          </div>

        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Cookies;
