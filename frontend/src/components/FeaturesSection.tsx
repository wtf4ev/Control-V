import { Brain, Zap, Bell, Shield, Eye, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "MediaPipe AI tracks 33 3D skeletal landmarks in real-time, focusing on upper-body keypoints to distinguish human movement from background noise."
  },
  {
    icon: Zap,
    title: "Instant Detection",
    description: "Sub-100ms response time ensures immediate recognition of seizure-like movements through oscillation and amplitude analysis."
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Configurable alert system with visual and audio notifications. Alerts persist for 3 seconds to ensure they're noticed."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "All processing happens locally on your device. No video data is transmitted or stored externally."
  },
  {
    icon: Eye,
    title: "Continuous Monitoring",
    description: "2-second rolling window analysis provides consistent monitoring without gaps, tracking movements frame by frame."
  },
  {
    icon: BarChart3,
    title: "Live Metrics",
    description: "Real-time display of oscillation count and movement amplitude helps caregivers understand detection confidence."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Advanced Technology for <span className="gradient-text">Peace of Mind</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Built with cutting-edge computer vision and machine learning to provide reliable, 
            real-time seizure detection.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-glow transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
