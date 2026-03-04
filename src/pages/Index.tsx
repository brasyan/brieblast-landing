import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import MarqueeSection from "@/components/MarqueeSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <HeroSection />
      <MarqueeSection />
      <FeaturesSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
};

export default Index;
