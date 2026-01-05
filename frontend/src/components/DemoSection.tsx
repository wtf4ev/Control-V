import { useState, useEffect } from "react";
import { Play, Pause, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Define the Fetch Function
const fetchBackendData = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/status");
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  } catch (err) {
    return { status: "Offline", seizure_detected: false, debug_shakes: 0, debug_energy: 0 };
  }
};

const DemoSection = () => {
  const [isRunning, setIsRunning] = useState(false);
  
  // HISTORY NOW STORES AN OBJECT: { value, isSeizure }
  const [history, setHistory] = useState<{ value: number; isSeizure: boolean }[]>([]);
  
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ["demoData"],
    queryFn: fetchBackendData,
    refetchInterval: 100,
    enabled: isRunning,
  });

  const shakes = data?.debug_shakes || 0;
  const energy = data?.debug_energy || 0;
  const isAlert = data?.seizure_detected || false;
  const isConnected = data?.status === "Running";

  // Update History Graph
  useEffect(() => {
    if (isRunning) {
      setHistory(prev => {
        // Store both the Energy Value AND whether it was a Seizure at that moment
        const newDataPoint = { value: energy, isSeizure: isAlert };
        const newHistory = [...prev, newDataPoint];
        return newHistory.slice(-60); // Keep last 6 seconds
      });
    }
  }, [energy, isAlert, isRunning]);

  const reset = () => {
    setIsRunning(false);
    setHistory([]);
    queryClient.removeQueries({ queryKey: ["demoData"] });
  };

  const MIN_OSCILLATIONS = 5.0; 
  const MIN_AMPLITUDE = 15;

  return (
    <section id="demo" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Live Demo
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            See the Algorithm <span className="gradient-text">In Action</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Interactive visualization. The graph marks exactly when the seizure logic triggers.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lifted bg-background border border-border">
            
            {/* Status Bar */}
            <div className={`px-6 py-4 flex items-center justify-between transition-all duration-300 ${
              isAlert ? 'bg-red-500 text-white' : 'bg-background border-b border-border'
            }`}>
              <div className="flex items-center gap-3">
                {isAlert ? (
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                ) : (
                  <div className={`flex items-center gap-2 ${isConnected ? "text-green-500" : "text-red-500"}`}>
                     {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                  </div>
                )}
                <span className="font-display font-semibold uppercase tracking-wide">
                  {isAlert ? 'SEIZURE ACTIVITY DETECTED' : (isConnected ? 'SYSTEM CONNECTED' : 'SYSTEM OFFLINE')}
                </span>
              </div>
              <span className="text-sm opacity-80 font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant={isRunning ? "secondary" : "default"}
                  onClick={() => setIsRunning(!isRunning)}
                  className="gap-2 w-32"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Pause' : 'Start Live'}
                </Button>
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reset Graph
                </Button>
              </div>

              {/* Metrics Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Oscillations Metric */}
                <div className="p-5 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Oscillations (Repetitions)</span>
                    <span className={`text-2xl font-mono font-bold ${shakes >= MIN_OSCILLATIONS ? 'text-red-500' : 'text-foreground'}`}>
                      {shakes.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${shakes >= MIN_OSCILLATIONS ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min((shakes / MIN_OSCILLATIONS) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>0</span>
                    <span className="text-primary font-medium">Threshold: {MIN_OSCILLATIONS}</span>
                    <span>{MIN_OSCILLATIONS * 2}</span>
                  </div>
                </div>

                {/* Amplitude Metric */}
                <div className="p-5 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Amplitude (Energy)</span>
                    <span className={`text-2xl font-mono font-bold ${energy >= MIN_AMPLITUDE ? 'text-red-500' : 'text-foreground'}`}>
                      {energy.toFixed(1)}px
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${energy >= MIN_AMPLITUDE ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min((energy / MIN_AMPLITUDE) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>0px</span>
                    <span className="text-primary font-medium">Threshold: {MIN_AMPLITUDE}px</span>
                    <span>{MIN_AMPLITUDE * 2}px</span>
                  </div>
                </div>
              </div>

              {/* REAL-TIME GRAPH WITH SEIZURE MARKERS */}
              <div className="p-5 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Live Energy History</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                     <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600 rounded-full"></div> Seizure</span>
                     <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400 rounded-full"></div> High Energy</span>
                     <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Normal</span>
                  </div>
                </div>
                
                <div className="flex items-end gap-0.5 h-40 border-b border-border/50 pb-1 overflow-hidden relative">
                  {history.map((point, i) => {
                    // Logic for Bar Color
                    let barColor = 'bg-blue-500/50'; // Normal
                    let glow = '';

                    if (point.isSeizure) {
                        barColor = 'bg-red-600'; // SEIZURE DETECTED
                        glow = 'shadow-[0_0_15px_rgba(220,38,38,0.8)] z-10'; // Red Glow
                    } else if (point.value >= MIN_AMPLITUDE) {
                        barColor = 'bg-orange-400/80'; // High Energy (Warning)
                    }

                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all duration-75 ${barColor} ${glow}`}
                        style={{ height: `${Math.min((point.value / 40) * 100, 100)}%` }}
                      >
                         {/* Optional small dot on top of seizure bars to mark them clearly */}
                         {point.isSeizure && (
                            <div className="w-full h-1 bg-white/50 absolute top-0 left-0" />
                         )}
                      </div>
                    );
                  })}
                  
                  {history.length === 0 && (
                     <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-sm absolute inset-0">
                        Press Start to view live data
                     </div>
                  )}
                  
                  {/* Threshold Line */}
                  <div 
                    className="absolute w-full border-t border-dashed border-red-500/30 pointer-events-none"
                    style={{ bottom: `${(MIN_AMPLITUDE / 40) * 100}%` }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;