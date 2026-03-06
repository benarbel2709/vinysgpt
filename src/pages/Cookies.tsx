import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import MarketingNav from "@/components/home/MarketingNav";
import MarketingFooter from "@/components/home/MarketingFooter";
import { useEffect } from "react";

export default function Cookies() {
  useEffect(() => { document.title = "Cookie Policy — Vinys"; window.scrollTo(0, 0); }, []);

  return (
    <Layout hideHeader hideFooter>
      <MarketingNav />
      <section className="relative w-full overflow-hidden" style={{ minHeight: "120px", background: "linear-gradient(to bottom, hsl(var(--surface-soft)), hsl(var(--background)))" }}>
        <div className="vinys-container py-12 sm:py-16 max-w-3xl mx-auto">
          <h1 className="font-display font-extrabold text-foreground text-2xl sm:text-3xl">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: March 2026</p>
        </div>
      </section>
      <section className="vinys-container max-w-3xl mx-auto pb-16">
        <div className="prose-vinys space-y-6 text-[15px] leading-relaxed text-foreground/85">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you interact with it.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Types of Cookies We Use</h2>
            <p><strong>Essential cookies:</strong> Required for the site to function properly, including authentication and security. These cannot be disabled.</p>
            <p><strong>Analytics cookies:</strong> Help us understand how visitors interact with our site so we can improve the experience. These are anonymized and do not track you across other websites.</p>
            <p><strong>Preference cookies:</strong> Remember your settings and choices (such as practice preferences and session configuration) to provide a personalized experience.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Cookies We Do Not Use</h2>
            <p>Vinys does <strong>not</strong> use advertising cookies, cross-site tracking cookies, or third-party marketing pixels. We do not share cookie data with advertisers.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Managing Cookies</h2>
            <p>You can control and delete cookies through your browser settings. Disabling certain cookies may affect the functionality of this site, particularly authentication and session management.</p>
            <p>Most browsers allow you to refuse or accept cookies, delete cookies, or be notified when a cookie is set. Refer to your browser's help section for instructions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Local Storage</h2>
            <p>In addition to cookies, Vinys uses browser local storage to save your practice plan, session history, and preferences locally on your device. This data remains on your device and is not transmitted to our servers unless you are signed in with an account.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p>If you have questions about our use of cookies, please contact us at <span className="text-accent font-medium">privacy@vinys.app</span>.</p>
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
