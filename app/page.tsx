import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { FeaturesGrid } from "@/components/marketing/FeaturesGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SocialProof } from "@/components/marketing/SocialProof";
import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <main className="mkt-shell min-h-full">
      <div aria-hidden className="mkt-grid pointer-events-none absolute inset-0 -z-10" />
      <Nav />
      <Hero />
      <ProductShowcase />
      <FeaturesGrid />
      <HowItWorks />
      <SocialProof />
      <CTASection />
      <Footer />
    </main>
  );
}
