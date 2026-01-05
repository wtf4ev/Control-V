import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Wifi, WifiOff, X, Maximize2, Minimize2, Phone, Save, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

// --- 1. BACKEND CONNECTION ---
const fetchBackendData = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/status");
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  } catch (err) {
    return { status: "Offline", seizure_detected: false };
  }
};

// --- 2. COMPONENT ---
export default function MonitoringPreview({ active, onClose }: { active: boolean, onClose: () => void }) {
  // Visual States
  const [visualShake, setVisualShake] = useState(1.2);
  const [visualEnergy, setVisualEnergy] = useState(8.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Phone Number States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Poll Backend
  const { data, isError } = useQuery({
    queryKey: ["backendStatus"],
    queryFn: fetchBackendData,
    refetchInterval: 500, // Check every 0.5s
    enabled: active,
  });

  const isAlert = data?.seizure_detected || false;
  const isConnected = data?.status === "Running";

  // --- SAVE CONTACT FUNCTION ---
  const saveContact = async () => {
    try {
      await fetch("http://localhost:5000/api/set_contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: phoneNumber }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000); 
    } catch (err) {
      console.error("Failed to save contact", err);
    }
  };

  // --- 🆕 DOWNLOAD REPORT FUNCTION ---
  const downloadReport = () => {
    // This triggers the browser to download the CSV file from the backend
    window.open("http://localhost:5000/api/get_report", "_blank");
  };

  // --- VISUAL EFFECTS LOOP ---
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setVisualShake(Math.random() * 2 + 0.5);
      setVisualEnergy(Math.random() * 12 + 5);
    }, 2000);
    return () => clearInterval(interval);
  }, [active]);

  // --- 🚨 BANK ROBBERY ALARM LOOP 🚨 ---
  useEffect(() => {
    let alarmInterval: NodeJS.Timeout;

    if (isAlert) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();

      const playBeep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // "Square" wave sounds harsher/louder (like a siren)
        osc.type = "square"; 
        
        // High pitch siren drop
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
        
        // Louder Volume
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      };

      // Play immediately
      playBeep();
      
      // Loop every 500ms (Urgent pacing)
      alarmInterval = setInterval(playBeep, 500);
    }

    return () => {
      if (alarmInterval) clearInterval(alarmInterval);
    };
  }, [isAlert]);

  if (!active) return null;

  // --- STYLING CLASSES ---
  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 w-screen h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
    : "fixed bottom-4 right-4 z-50 w-96 animate-in slide-in-from-bottom-10 fade-in duration-500";

  const cardClasses = isFullscreen
    ? "relative glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/90 text-white w-full max-w-5xl max-h-full flex flex-col"
    : "relative glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/80 backdrop-blur-md text-white";

  return (
    <div className={containerClasses}>
      <div className={isConnected && !isFullscreen ? "relative" : "relative w-full h-full flex flex-col items-center justify-center"}>
        
        {/* Glow Effect */}
        {!isFullscreen && (
          <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-50 transition-colors duration-500 ${
            isAlert ? "bg-red-500/40" : "bg-primary/20"
          }`} />
        )}
        
        {/* Main Card */}
        <div className={cardClasses}>
          
          {/* Header */}
          <div className={`px-6 py-4 flex items-center justify-between shrink-0 transition-all duration-500 ${
            isAlert ? 'bg-red-500/20 border-b border-red-500/50' : 'bg-white/5 border-b border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              {isAlert ? <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
              <span className={`font-display font-bold tracking-wider ${isAlert ? 'text-red-400' : 'text-emerald-400'}`}>
                {isAlert ? 'SEIZURE DETECTED' : 'MONITORING ACTIVE'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
               {/* Connection Status */}
               <div className="flex items-center gap-2 mr-2">
                  {isConnected && !isError ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                  <div className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
               </div>

               {/* 📄 REPORT DOWNLOAD BUTTON */}
               <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-emerald-400" onClick={downloadReport} title="Download Report">
                 <FileText className="w-4 h-4" />
               </Button>

               {/* Fullscreen Toggle */}
               <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white" onClick={() => setIsFullscreen(!isFullscreen)}>
                 {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
               </Button>

               {/* Close Button */}
               <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-red-400" onClick={onClose}>
                 <X className="w-4 h-4" />
               </Button>
            </div>
          </div>

          {/* Video Feed */}
          <div className={`relative bg-black overflow-hidden ${isFullscreen ? 'flex-1 w-full' : 'aspect-video'}`}>
            {isConnected ? (
              <img 
                src="http://localhost:5000/video_feed" 
                alt="Live Camera"
                className={`w-full h-full object-contain bg-black transition-transform duration-300 ${isAlert && !isFullscreen ? 'scale-105' : 'scale-100'}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">Waiting for camera...</div>
            )}

            {/* Scanlines */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="w-full h-full" style={{
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

             {/* --- ALERT OVERLAY --- */}
             {isAlert && (
               <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 animate-pulse pointer-events-none">
                  <div className="bg-red-600 text-white px-4 py-1 font-bold tracking-widest uppercase text-sm border border-red-400 shadow-xl flex flex-col items-center">
                    <span>⚠️ SEIZURE DETECTED</span>
                    {phoneNumber && (
                      <span className="text-[10px] normal-case opacity-90 mt-1">
                         Sending Alert to {phoneNumber}...
                      </span>
                    )}
                  </div>
               </div>
             )}
          </div>

          {/* Controls & Metrics */}
          <div className="p-6 space-y-4 bg-black/40 shrink-0">
            
            {/* Input Field */}
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <Phone className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Enter Phone (e.g. +91...)" 
                  className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-slate-600"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Button 
                  size="sm" 
                  variant={isSaved ? "default" : "secondary"} 
                  className={isSaved ? "bg-green-600 hover:bg-green-700 h-7 text-xs" : "h-7 text-xs"}
                  onClick={saveContact}
                >
                  {isSaved ? "Saved" : <div className="flex items-center gap-1">Save <Save className="w-3 h-3" /></div>}
                </Button>
            </div>

            {/* Graphs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
                  <span>Oscillations</span>
                  <span className="font-mono">{visualShake.toFixed(1)}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isAlert ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((visualShake / 3) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
                  <span>Amplitude</span>
                  <span className="font-mono">{visualEnergy.toFixed(1)}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isAlert ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((visualEnergy / 15) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Wave Animation */}
            <div className="flex items-end gap-1 h-10 mt-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all duration-300 ${isAlert ? 'bg-red-500/40' : 'bg-emerald-500/20'}`}
                  style={{ 
                    height: `${20 + Math.sin(Date.now() / 1000 + i) * 15 + Math.random() * 30}%`,
                    opacity: 0.3 + (i / 20) * 0.7
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}