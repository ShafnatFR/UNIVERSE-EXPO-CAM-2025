import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, Dice5, User, Users, Globe, Ticket, Loader2, Layout, Grid, columns, GalleryVertical, Timer } from 'lucide-react';
import { FilterType, GAME_ITEMS, GameItem, CollageMode } from '../types';

// Declare face-api on window
declare global {
  interface Window {
    faceapi: any;
  }
}

interface CameraInterfaceProps {
  onCapture: (images: string[], mode: CollageMode) => void;
}

export const CameraInterface: React.FC<CameraInterfaceProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.NONE);
  const [activeCollage, setActiveCollage] = useState<CollageMode>(CollageMode.SINGLE);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Gamification State
  const [gameActive, setGameActive] = useState(false);
  const [gameResult, setGameResult] = useState<GameItem | null>(null);

  // Capture Sequence State
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedBuffer, setCapturedBuffer] = useState<string[]>([]);

  // Animation Refs
  const requestRef = useRef<number>();
  const planetAngleRef = useRef<number>(0);
  const detectionsRef = useRef<any[]>([]);

  // 1. Initialize
  useEffect(() => {
    let stream: MediaStream | null = null;
    const loadModelsAndCamera = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        if (window.faceapi) {
            await Promise.all([
                window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            ]);
            setIsModelLoaded(true);
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 }, // Higher res for desktop
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play();
             startRendering();
          };
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setLoadingError("Camera access required.");
      }
    };
    loadModelsAndCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 2. Rendering Loop (Same filter logic, just optimized for resized canvas)
  const startRendering = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const detect = async () => {
        if (isModelLoaded && video.readyState === 4 && !video.paused && !video.ended) {
            const options = new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
            const detections = await window.faceapi.detectAllFaces(video, options);
            const displaySize = { width: canvas.width, height: canvas.height };
            // Simple resize without complex mirror calculation for now, visual only
            const resizedDetections = window.faceapi.resizeResults(detections, displaySize);
            detectionsRef.current = resizedDetections;
        }
    };

    const render = () => {
        if (!video || !canvas) return;
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        detect();
        drawFilters(ctx, canvas.width, canvas.height);
        drawGamification(ctx, canvas.width, canvas.height);

        requestRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const drawFilters = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const detections = detectionsRef.current;
    const getMirroredBox = (box: any) => ({
        x: width - (box.x + box.width),
        y: box.y, width: box.width, height: box.height
    });

    if (activeFilter === FilterType.FUTURE_EXPLORER) {
        ctx.fillStyle = 'rgba(120, 50, 200, 0.15)';
        ctx.fillRect(0, 0, width, height);
        detections.forEach(det => {
            const box = getMirroredBox(det.box);
            const cx = box.x + box.width / 2;
            const cy = box.y + box.height / 2;
            const size = Math.max(box.width, box.height) * 1.4;
            
            ctx.beginPath();
            ctx.arc(cx, cy, size/2, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(100,200,255,0.2)';
            ctx.fill();
            ctx.lineWidth = size * 0.05;
            ctx.strokeStyle = '#E0E0E0';
            ctx.stroke();
            
            ctx.fillStyle = '#00FFCC';
            ctx.font = `bold ${size * 0.1}px Orbitron`;
            ctx.textAlign = 'center';
            ctx.fillText("UNIVERSE-25", cx, cy + size/2 + 20);
        });
    }
    if (activeFilter === FilterType.CONSTELLATION) {
        const centers: any[] = [];
        detections.forEach(det => {
            const box = getMirroredBox(det.box);
            const cx = box.x + box.width/2;
            const cy = box.y + box.height/2;
            centers.push({x: cx, y: cy});
            ctx.fillStyle = '#FFF';
            ctx.font = `${box.width/3}px serif`;
            ctx.fillText("☆", cx-10, cy);
        });
        if (centers.length > 1) {
            ctx.strokeStyle = '#00F0FF';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(centers[0].x, centers[0].y);
            centers.slice(1).forEach((c: any) => ctx.lineTo(c.x, c.y));
            if(centers.length > 2) ctx.lineTo(centers[0].x, centers[0].y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    if (activeFilter === FilterType.ORBIT_AURA) {
        planetAngleRef.current += 0.02;
        const grad = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, width);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        const cx = width/2, cy = height/2;
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(planetAngleRef.current)*width*0.3, cy + Math.sin(planetAngleRef.current)*height*0.2, 30, 0, Math.PI*2);
        ctx.fill();
    }
    if (activeFilter === FilterType.TICKET) {
        const m = 40;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;
        ctx.strokeRect(m, m, width-m*2, height-m*2);
        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 48px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText("UNIVERSE TICKET", width/2, height - 60);
    }
  };

  const drawGamification = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!gameActive && !gameResult) return;
      // Static center top for desktop stability
      const boxW = 400;
      const boxH = 150;
      const x = width/2;
      const y = 100;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.roundRect(-boxW/2, -boxH/2, boxW, boxH, 20);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'black';
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (gameResult) {
          ctx.fillStyle = 'black';
          ctx.font = 'bold 20px Inter';
          ctx.fillText(gameResult.type, 0, -30);
          ctx.fillStyle = '#7C3AED';
          ctx.font = 'bold 30px Orbitron';
          ctx.fillText(gameResult.text, 0, 10);
      } else {
          ctx.fillStyle = 'black';
          ctx.font = 'italic 24px Inter';
          ctx.fillText("Scanning...", 0, 0);
      }
      ctx.restore();
  };

  // --- LOGIC: Collage & Countdown ---

  const triggerCaptureSequence = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCapturedBuffer([]);

    const shotsNeeded = activeCollage === CollageMode.SINGLE ? 1 
                      : activeCollage === CollageMode.GRID_2X2 ? 4 
                      : 3; // Strip

    const buffer: string[] = [];

    for (let i = 0; i < shotsNeeded; i++) {
        // Start Countdown
        for (let c = 3; c > 0; c--) {
            setCountdown(c);
            await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(0); // "Snap!"

        // Flash Effect
        const flashEl = document.getElementById('camera-flash');
        if(flashEl) {
            flashEl.style.opacity = '1';
            setTimeout(() => flashEl.style.opacity = '0', 100);
        }

        // Capture
        if (canvasRef.current) {
            const data = canvasRef.current.toDataURL('image/png', 1.0);
            buffer.push(data);
            setCapturedBuffer([...buffer]); // Update preview state if we want small thumbs
        }

        // Small delay between shots if not last
        if (i < shotsNeeded - 1) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    setCountdown(null);
    setIsCapturing(false);
    onCapture(buffer, activeCollage);
  };

  const spinPlanet = useCallback(() => {
    if (gameActive) return;
    setGameActive(true);
    setGameResult(null);
    let counter = 0;
    const interval = setInterval(() => {
      setGameResult(GAME_ITEMS[Math.floor(Math.random() * GAME_ITEMS.length)]);
      counter++;
      if (counter >= 20) {
        clearInterval(interval);
        setGameActive(false);
      }
    }, 100);
  }, [gameActive]);

  const filters = [
    { id: FilterType.NONE, icon: <RefreshCw />, label: 'Normal' },
    { id: FilterType.FUTURE_EXPLORER, icon: <User />, label: 'Future' },
    { id: FilterType.CONSTELLATION, icon: <Users />, label: 'Connect' },
    { id: FilterType.ORBIT_AURA, icon: <Globe />, label: 'Aura' },
    { id: FilterType.TICKET, icon: <Ticket />, label: 'Ticket' },
  ];

  const collages = [
    { id: CollageMode.SINGLE, icon: <Layout />, label: 'Single' },
    { id: CollageMode.GRID_2X2, icon: <Grid />, label: 'Grid 4' },
    { id: CollageMode.STRIP_3, icon: <GalleryVertical />, label: 'Strip 3' },
  ];

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden relative">
        {/* Flash Overlay */}
        <div id="camera-flash" className="absolute inset-0 bg-white opacity-0 pointer-events-none transition-opacity duration-100 z-50"></div>

        {/* LEFT: Camera Canvas */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-0" muted playsInline />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain" />
            
            {/* Countdown Overlay */}
            {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm">
                    <div className="text-[200px] font-space font-black text-white drop-shadow-[0_0_50px_rgba(236,72,153,0.8)] animate-pulse">
                        {countdown}
                    </div>
                </div>
            )}
             {countdown === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-40">
                    <div className="text-8xl font-space font-black text-white drop-shadow-lg">SNAP!</div>
                </div>
            )}

            {/* Collage Progress Indicator */}
            {isCapturing && (
                 <div className="absolute top-8 right-8 bg-black/50 px-4 py-2 rounded-full text-white font-space border border-white/20">
                    Shot {capturedBuffer.length + 1} / {activeCollage === CollageMode.SINGLE ? 1 : activeCollage === CollageMode.GRID_2X2 ? 4 : 3}
                 </div>
            )}
        </div>

        {/* RIGHT: Control Panel */}
        <div className="w-96 h-full bg-[#111] border-l border-white/10 flex flex-col p-6 space-y-8 overflow-y-auto z-20 shadow-2xl">
            <div>
                <h2 className="text-white font-space text-2xl font-bold mb-1">UniVerse Cam</h2>
                <p className="text-gray-400 text-sm">Control Center</p>
            </div>

            {/* 1. Collage Mode */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shooting Mode</label>
                <div className="grid grid-cols-3 gap-2">
                    {collages.map((c) => (
                        <button 
                            key={c.id}
                            onClick={() => setActiveCollage(c.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                activeCollage === c.id 
                                ? 'bg-purple-900/50 border-purple-500 text-white' 
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {React.cloneElement(c.icon as React.ReactElement, { size: 20 })}
                            <span className="text-[10px] mt-1 font-medium">{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Filters */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visual Filters</label>
                <div className="grid grid-cols-3 gap-2">
                    {filters.map((f) => (
                        <button 
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                activeFilter === f.id 
                                ? 'bg-pink-900/50 border-pink-500 text-white' 
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {React.cloneElement(f.icon as React.ReactElement, { size: 20 })}
                            <span className="text-[10px] mt-1 font-medium">{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Gamification */}
            <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Randomizer</span>
                    <Dice5 className="w-4 h-4 text-purple-400" />
                </div>
                <button 
                    onClick={spinPlanet}
                    disabled={gameActive}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                    {gameActive ? 'Spinning...' : 'Spin the Planet'}
                </button>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Shutter Button */}
            <div className="flex flex-col items-center space-y-4">
                 <button 
                    onClick={triggerCaptureSequence}
                    disabled={isCapturing}
                    className="group relative w-24 h-24 rounded-full bg-yellow-400 border-4 border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-black/20 animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-2 rounded-full border border-black/10"></div>
                </button>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
                    {isCapturing ? 'Capturing...' : 'Start Mission'}
                </p>
            </div>
        </div>
    </div>
  );
};
