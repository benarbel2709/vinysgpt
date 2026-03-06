import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import MarketingNav from "@/components/home/MarketingNav";
import MarketingFooter from "@/components/home/MarketingFooter";
import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => { document.title = "Privacy Policy — Vinys"; window.scrollTo(0, 0); }, []);

  return (
    <Layout hideHeader hideFooter>
      <MarketingNav />
      <section className="relative w-full overflow-hidden" style={{ minHeight: "120px", background: "linear-gradient(to bottom, hsl(var(--surface-soft)), hsl(var(--background)))" }}>
        <div className="vinys-container py-12 sm:py-16 max-w-3xl mx-auto">
          <h1 className="font-display font-extrabold text-foreground text-2xl sm:text-3xl">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: February 2026</p>
        </div>
      </section>
      <section className="vinys-container max-w-3xl mx-auto pb-16">
        <div className="prose-vinys space-y-6 text-[15px] leading-relaxed text-foreground/85">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>When you use Vinys, we collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> Email address, display name, first name (when you create an account)</li>
              <li><strong>Health-related preferences:</strong> Conditions you select (e.g., back pain, pregnancy), energy levels, mobility preferences, and physical restrictions — used solely to generate your personalized practice</li>
              <li><strong>Usage data:</strong> Session completions, check-in responses, and practice history</li>
              <li><strong>Technical data:</strong> Browser type, device information, and anonymized analytics</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
            <p>Your data is used exclusively to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generate and adapt your personalized yoga sessions</li>
              <li>Track your progress and session history</li>
              <li>Improve the Service's exercise recommendations and adaptive logic</li>
              <li>Communicate with you about your account and the Service</li>
            </ul>
            <p>We <strong>never sell your personal data</strong> to third parties.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Health Data</h2>
            <p>The conditions and preferences you share with Vinys are stored securely and used only to personalize your practice. This information is <strong>not shared with any third parties</strong>, including insurance companies, employers, or advertisers.</p>
            <p>Vinys does not collect biometric data, medical records, or diagnostic information.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption and access controls. We use row-level security policies to ensure that only you can access your personal data.</p>
            <p>Guest users' data is stored locally on their device and is not synced to our servers.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Your Rights Under California Law (CCPA)</h2>
            <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The right to know what personal information we collect and how it is used</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to opt out of the sale of your personal information (Vinys does not sell personal data)</li>
              <li>The right to non-discrimination for exercising your privacy rights</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Your General Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access</strong> your personal data at any time through the Settings page</li>
              <li><strong>Export</strong> your data using the built-in export feature</li>
              <li><strong>Delete</strong> your data by performing a full reset in Settings or by contacting us</li>
              <li><strong>Withdraw consent</strong> and close your account at any time</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Cookies & Tracking</h2>
            <p>Vinys uses minimal cookies required for authentication and session management. We do not use advertising cookies or cross-site tracking. Anonymous usage analytics may be collected to improve the Service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Third-Party Services</h2>
            <p>Vinys uses the following third-party services to operate:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Authentication & database:</strong> Secure cloud infrastructure for account management and data storage</li>
              <li><strong>Payment processing:</strong> Stripe (if applicable) — we never store your payment card details</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Children's Privacy</h2>
            <p>Vinys is not intended for children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this page periodically.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
            <p>For privacy-related questions or data requests, contact us at <span className="text-accent font-medium">privacy@vinys.app</span>.</p>
          </section>
        </div>

        <div className="pt-6 mt-8 border-t border-border">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to home</Link>
        </div>
      </section>
      <MarketingFooter />
    </Layout>
  );
}
