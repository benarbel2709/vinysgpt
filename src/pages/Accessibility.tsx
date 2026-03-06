import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import MarketingNav from "@/components/home/MarketingNav";
import MarketingFooter from "@/components/home/MarketingFooter";
import { useEffect } from "react";

export default function Accessibility() {
  useEffect(() => { document.title = "Accessibility — Vinys"; window.scrollTo(0, 0); }, []);

  return (
    <Layout hideHeader hideFooter>
      <MarketingNav />
      <section className="relative w-full overflow-hidden" style={{ minHeight: "120px", background: "linear-gradient(to bottom, hsl(var(--surface-soft)), hsl(var(--background)))" }}>
        <div className="vinys-container py-12 sm:py-16 max-w-3xl mx-auto">
          <h1 className="font-display font-extrabold text-foreground text-2xl sm:text-3xl">Accessibility Statement</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: March 2026</p>
        </div>
      </section>
      <section className="vinys-container max-w-3xl mx-auto pb-16">
        <div className="prose-vinys space-y-6 text-[15px] leading-relaxed text-foreground/85">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Our Commitment</h2>
            <p>Vinys is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.</p>
            <p>We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with a wide range of disabilities.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">What We Do</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use semantic HTML elements for better screen reader support</li>
              <li>Maintain sufficient color contrast ratios across the interface</li>
              <li>Provide text alternatives for meaningful images and icons</li>
              <li>Ensure keyboard navigability throughout the application</li>
              <li>Use ARIA labels and roles where appropriate</li>
              <li>Design touch targets with a minimum size of 44×44 pixels for mobile accessibility</li>
              <li>Support reduced motion preferences where animations are used</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Therapeutic Accessibility</h2>
            <p>As a therapeutic yoga platform designed for people with physical conditions and limitations, accessibility is central to our mission. Our adaptive system considers:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Physical restrictions and contraindications</li>
              <li>Varying energy levels and pain thresholds</li>
              <li>Simplified exercise instructions with clear safety guidance</li>
              <li>Flexible session durations to accommodate different capacities</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Known Limitations</h2>
            <p>While we strive for full compliance, some areas of the site may not yet be fully accessible. We are actively working to address these, including improving screen reader support for our exercise player and expanding keyboard navigation coverage.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Feedback</h2>
            <p>If you encounter accessibility barriers on Vinys, please let us know at <span className="text-accent font-medium">accessibility@vinys.app</span>. We take accessibility feedback seriously and will work to address issues promptly.</p>
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
