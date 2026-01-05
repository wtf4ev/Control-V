import { Shield, Eye, Zap, Activity, Lock, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

// This prop interface ensures the parent component can control the start action
interface HeroSectionProps {
  onStart: () => void;
}

const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          
          {/* --- LEFT CONTENT (Text & Buttons) --- */}
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-foreground/80 text-sm font-medium backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI-Powered Detection System
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Real-Time{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Seizure Detection
              </span>{" "}
              Using Computer Vision
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Advanced AI technology that monitors body movements through your camera, 
              detecting potential seizure patterns instantly with high accuracy and 
              immediate alerts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                onClick={onStart} // <--- THIS MAKES THE BUTTON WORK
              >
                <Eye className="w-5 h-5" />
                Start Monitoring
              </Button>
              
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                Learn More
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-3xl font-bold font-display">AI</p>
                <p className="text-sm text-muted-foreground">Powered</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold font-display">&lt;100ms</p>
                <p className="text-sm text-muted-foreground">Latency</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold font-display">24/7</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </div>

          {/* --- RIGHT CONTENT (Static Visual Preview) --- */}
          {/* This acts as a 'Hero Image' until the user clicks Start */}
          <div className="relative animate-in slide-in-from-right duration-700 delay-200">
            <div className="relative z-10 bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              {/* Mock Header */}
              <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                 </div>
                 <div className="text-xs font-mono text-muted-foreground uppercase">System Idle</div>
              </div>

              {/* Mock Visualization Area */}
              <div className="aspect-video bg-black/90 rounded-lg overflow-hidden relative group">
                 {/* Grid Lines */}
                 <div className="absolute inset-0 opacity-20" 
                      style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                 />
                 
                 {/* Center Graphic */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-24 h-24 text-primary/20 group-hover:text-primary/40 transition-colors duration-500" />
                 </div>

                 {/* Floating UI Elements */}
                 <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs font-mono text-green-400 border border-green-900/50">
                    CAMERA_01: READY
                 </div>
                 
                 {/* Scanline */}
                 <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[20%] w-full animate-[scan_3s_ease-in-out_infinite]" />
              </div>

              {/* Mock Metrics */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                 <div className="bg-background/50 p-3 rounded border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Processing Unit</div>
                    <div className="flex items-center gap-2">
                       <Server className="w-4 h-4 text-primary" />
                       <span className="font-mono font-bold">ONLINE</span>
                    </div>
                 </div>
                 <div className="bg-background/50 p-3 rounded border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Security</div>
                    <div className="flex items-center gap-2">
                       <Lock className="w-4 h-4 text-primary" />
                       <span className="font-mono font-bold">ENCRYPTED</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Decorative Elements behind the card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-600 rounded-3xl blur-2xl opacity-20 -z-10" />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
