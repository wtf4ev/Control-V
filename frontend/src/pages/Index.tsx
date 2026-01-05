import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DemoSection from "@/components/DemoSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import MonitoringPreview from "@/components/MonitoringPreview";

const Index = () => {
  // State to control when the monitoring widget is visible
  const [isMonitoring, setIsMonitoring] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Pass the 'Start' function to the Button in HeroSection */}
        <HeroSection onStart={() => setIsMonitoring(true)} />

        {/* Pass both 'active' state AND 'onClose' handler */}
        <MonitoringPreview 
            active={isMonitoring} 
            onClose={() => setIsMonitoring(false)} 
        />
        
        <FeaturesSection />
        <HowItWorksSection />
        <DemoSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;