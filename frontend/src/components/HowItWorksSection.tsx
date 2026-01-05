import { Camera, Cpu, Activity, Bell } from "lucide-react";

const steps = [
  {
    icon: Camera,
    number: "01",
    title: "Camera Input",
    description: "Standard webcam captures video at 15 FPS, sending frames for real-time processing."
  },
  {
    icon: Cpu,
    number: "02",
    title: "Pose Estimation",
    description: "MediaPipe AI tracks 33 3D skeletal landmarks in real-time, focusing on upper-body keypoints to distinguish human movement from background noise."
  },
  {
    icon: Activity,
    number: "03",
    title: "Movement Analysis",
    description: "Algorithm analyzes temporal vector changes over a rolling 1-second window, converting physical tremors into quantifiable frequency data."
  },
  {
    icon: Bell,
    number: "04",
    title: "Alert Trigger",
    description: "When high-frequency oscillations and displacement amplitude exceed dynamic safety thresholds, the system triggers an immediate emergency alert."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Detection in <span className="gradient-text">Four Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Understanding the technology behind our seizure detection algorithm.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Card */}
                <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300 h-full">
                  {/* Number Badge */}
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-display font-bold">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mt-4 mb-5 group-hover:bg-primary/10 transition-colors">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 -right-4 w-8 h-8 z-10">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 border-t-2 border-r-2 border-primary/40 rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specs */}
        <div className="mt-16 p-8 rounded-2xl glass-card">
          <h3 className="font-display text-xl font-semibold mb-6 text-center">Detection Parameters</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <p className="font-mono text-2xl font-bold text-primary">15 FPS</p>
              <p className="text-sm text-muted-foreground mt-1">Frame Rate</p>
            </div>
            <div className="text-center p-4">
              <p className="font-mono text-2xl font-bold text-primary">2 sec</p>
              <p className="text-sm text-muted-foreground mt-1">Analysis Window</p>
            </div>
            <div className="text-center p-4">
              <p className="font-mono text-2xl font-bold text-primary">≥3</p>
              <p className="text-sm text-muted-foreground mt-1">Min. Oscillations</p>
            </div>
            <div className="text-center p-4">
              <p className="font-mono text-2xl font-bold text-primary">≥15px</p>
              <p className="text-sm text-muted-foreground mt-1">Min. Amplitude</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
