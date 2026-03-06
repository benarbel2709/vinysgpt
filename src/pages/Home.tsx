import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import MarketingNav from "@/components/home/MarketingNav";
import HomeHero from "@/components/home/HomeHero";
import GuidedWalkthrough from "@/components/home/GuidedWalkthrough";
import SocialProof from "@/components/home/SocialProof";
import WhyThisApproachWorks from "@/components/home/WhyThisApproachWorks";
import PersonalizationEngine from "@/components/home/PersonalizationEngine";
import SafetyArchitecture from "@/components/home/SafetyArchitecture";
import SessionFlowVisual from "@/components/home/SessionFlowVisual";
import AdaptivePracticeEngine from "@/components/home/AdaptivePracticeEngine";
import HowItWorks from "@/components/home/HowItWorks";
import FirstSessionPreview from "@/components/home/FirstSessionPreview";
import WhoVinysIsFor from "@/components/home/WhoVinysIsFor";
import ConditionsSection from "@/components/home/ConditionsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrustCredibility from "@/components/home/TrustCredibility";
import ViniyogaSection from "@/components/home/ViniyogaSection";
import ConsistencyOverIntensity from "@/components/home/ConsistencyOverIntensity";
import FAQSection from "@/components/home/FAQSection";
import FinalCTA from "@/components/home/FinalCTA";
import MarketingFooter from "@/components/home/MarketingFooter";

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Vinys",
    "description": "Adaptive therapeutic yoga built around your specific health conditions, energy level, and schedule.",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "provider": { "@type": "Organization", "name": "Vinys", "url": "https://vinys.app" },
  };

  return (
    <Layout hideHeader hideFooter>
      <Helmet>
        <link
          rel="preload"
          as="image"
          href="https://xyuvmzonhrrjslehggyo.supabase.co/storage/v1/object/public/public-assets/vinys-hero-darkwood-v3.png"
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="flex flex-col items-center">
        <MarketingNav />
        <HomeHero />
        <GuidedWalkthrough />
        <SocialProof />
        <WhyThisApproachWorks />
        <PersonalizationEngine />
        <SafetyArchitecture />
        <SessionFlowVisual />
        <AdaptivePracticeEngine />
        <HowItWorks />
        <FirstSessionPreview />
        <WhoVinysIsFor />
        <ConditionsSection />
        <TestimonialsSection />
        <TrustCredibility />
        <ViniyogaSection />
        <ConsistencyOverIntensity />
        <FAQSection />
        <FinalCTA />
        <MarketingFooter />
      </div>
    </Layout>
  );
}
