import React, { useState, useRef, useEffect } from 'react';
import { Download, RotateCcw, Type, Image as ImageIcon, Sparkles, LayoutTemplate } from 'lucide-react';
import { CollageMode, FrameType, Sticker } from '../types';

interface ResultPreviewProps {
  images: string[];
  collageMode: CollageMode;
  onRetake: () => void;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({ images, collageMode, onRetake }) => {
  const [caption, setCaption] = useState('');
  const [finalImage, setFinalImage] = useState<string>('');
  const [activeFrame, setActiveFrame] = useState<FrameType>(FrameType.NONE);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [draggingStickerId, setDraggingStickerId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Available Stickers (Using Emojis for portability)
  const stickerOptions = ['👨‍🚀', '🚀', '🪐', '👽', '🎓', '✨', 'LULUS!', 'A+', 'UNIVERSE'];

  // Add a new sticker
  const addSticker = (type: string) => {
      const newSticker: Sticker = {
          id: Date.now(),
          type,
          x: 0.5, // Center relative (0-1)
          y: 0.5,
          scale: type.length > 2 ? 0.08 : 0.1 // Adjust scale for text vs emoji
      };
      setStickers([...stickers, newSticker]);
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, width: number, height: number, frame: FrameType) => {
      if (frame === FrameType.COCKPIT) {
          ctx.save();
          // HUD Lines
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
          ctx.lineWidth = 5;
          
          // Corners
          const s = 100;
          ctx.beginPath();
          // Top Left
          ctx.moveTo(0, s); ctx.lineTo(0,0); ctx.lineTo(s, 0);
          // Top Right
          ctx.moveTo(width-s, 0); ctx.lineTo(width,0); ctx.lineTo(width, s);
          // Bot Left
          ctx.moveTo(0, height-s); ctx.lineTo(0,height); ctx.lineTo(s, height);
          // Bot Right
          ctx.moveTo(width-s, height); ctx.lineTo(width,height); ctx.lineTo(width, height-s);
          ctx.stroke();

          // Crosshair
          ctx.beginPath();
          ctx.moveTo(width/2 - 20, height/2); ctx.lineTo(width/2 + 20, height/2);
          ctx.moveTo(width/2, height/2 - 20); ctx.lineTo(width/2, height/2 + 20);
          ctx.stroke();

          // Text overlay
          ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
          ctx.font = '24px Orbitron';
          ctx.fillText("SYS: ONLINE", 40, 40);
          ctx.fillText("TARGET: FUTURE", width - 240, 40);
          ctx.restore();
      } else if (frame === FrameType.MAGAZINE) {
          ctx.save();
          // Magazine Header
          ctx.fillStyle = '#E11D48'; // Rose red
          ctx.font = 'bold 120px Impact, sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          ctx.fillText("UNIVERSE", width/2, 140);
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 40px Inter';
          ctx.fillText("MAGAZINE", width/2, 180);

          // Student of the year
          ctx.textAlign = 'left';
          ctx.fillStyle = '#FBBF24'; // Amber
          ctx.font = 'bold 60px Inter';
          ctx.fillText("STUDENT", 50, height - 150);
          ctx.fillStyle = 'white';
          ctx.fillText("OF THE YEAR", 50, height - 90);
          
          // Barcode dummy
          ctx.fillStyle = 'white';
          ctx.fillRect(width - 200, height - 120, 150, 80);
          ctx.restore();
      }
  };

  const renderCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load all images first
      const loadedImages = await Promise.all(
        images.map(src => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
          });
        })
      );

      const baseWidth = loadedImages[0].width;
      const baseHeight = loadedImages[0].height;

      // Layout Config
      const layoutConfig: Record<string, { cols: number, rows: number }> = {
        [CollageMode.SINGLE]:   { cols: 1, rows: 1 },
        [CollageMode.GRID_2X2]: { cols: 2, rows: 2 },
        [CollageMode.STRIP_3]:  { cols: 1, rows: 3 },
        [CollageMode.STRIP_4]:  { cols: 1, rows: 4 },
        [CollageMode.GRID_2X3]: { cols: 3, rows: 2 },
        [CollageMode.GRID_3X3]: { cols: 3, rows: 3 },
      };

      const config = layoutConfig[collageMode] || { cols: 1, rows: 1 };
      const GAP = 20;
      const OUTER_PADDING = 50;
      const FOOTER_HEIGHT = 150;

      const finalW = (baseWidth * config.cols) + (GAP * (config.cols - 1)) + (OUTER_PADDING * 2);
      const finalH = (baseHeight * config.rows) + (GAP * (config.rows - 1)) + (OUTER_PADDING * 2) + FOOTER_HEIGHT;

      canvas.width = finalW;
      canvas.height = finalH;

      // 1. Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, finalW, finalH);

      // 2. Photos
      loadedImages.forEach((img, i) => {
          const col = i % config.cols;
          const row = Math.floor(i / config.cols);
          const x = OUTER_PADDING + (col * (baseWidth + GAP));
          const y = OUTER_PADDING + (row * (baseHeight + GAP));

          ctx.drawImage(img, x, y, baseWidth, baseHeight);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 10;
          ctx.strokeRect(x, y, baseWidth, baseHeight);
      });

      // 3. Selected Frame Overlay
      drawFrame(ctx, finalW, finalH, activeFrame);

      // 4. Stickers
      stickers.forEach(s => {
          ctx.save();
          const x = s.x * finalW;
          const y = s.y * finalH;
          const fontSize = finalW * s.scale;
          
          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Add drop shadow to make sticker pop
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          
          if (s.type.length > 3) {
             // Text Sticker
             ctx.font = `bold ${fontSize}px Orbitron`;
             ctx.fillStyle = '#00FFCC';
             ctx.strokeStyle = 'black';
             ctx.lineWidth = 4;
             ctx.strokeText(s.type, x, y);
             ctx.fillText(s.type, x, y);
          } else {
             // Emoji Sticker
             ctx.fillText(s.type, x, y);
          }
          ctx.restore();
      });

      // 5. Footer Text
      ctx.save();
      const fontSize = Math.floor(finalW * 0.04);
      ctx.font = `bold ${fontSize}px Orbitron`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 15;
      ctx.textAlign = 'right';
      ctx.fillText("UniVerse Expo 2025", finalW - OUTER_PADDING, finalH - 50);
      
      ctx.textAlign = 'left';
      ctx.font = `${Math.floor(fontSize * 0.6)}px Inter`;
      const date = new Date().toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      ctx.fillText(date, OUTER_PADDING, finalH - 50);
      ctx.restore();

      // 6. User Caption
      if (caption.trim()) {
          ctx.save();
          const capSize = Math.floor(finalW * 0.05); 
          ctx.font = `bold ${capSize}px Orbitron`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.shadowColor = '#00FFFF';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(caption, finalW / 2, finalH - 100);
          ctx.restore();
      }

      setFinalImage(canvas.toDataURL('image/png'));
  };

  // Re-render when anything changes
  useEffect(() => {
    const t = setTimeout(renderCanvas, 100);
    return () => clearTimeout(t);
  }, [images, collageMode, caption, activeFrame, stickers]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!containerRef.current || stickers.length === 0) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const clickX = (clientX - rect.left) / rect.width;
      const clickY = (clientY - rect.top) / rect.height;

      // Find clicked sticker (simple distance check)
      // Since stickers are centered, we check if click is roughly near sticker
      // Note: This is approximate hit testing
      const hitSticker = stickers.find(s => {
          const dist = Math.sqrt(Math.pow(s.x - clickX, 2) + Math.pow(s.y - clickY, 2));
          return dist < 0.05; // 5% radius hit area
      });

      if (hitSticker) {
          setDraggingStickerId(hitSticker.id);
      }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!draggingStickerId || !containerRef.current) return;
      e.preventDefault();

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newX = (clientX - rect.left) / rect.width;
      const newY = (clientY - rect.top) / rect.height;

      setStickers(stickers.map(s => 
          s.id === draggingStickerId ? { ...s, x: newX, y: newY } : s
      ));
  };

  const handleMouseUp = () => {
      setDraggingStickerId(null);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = `universe-collage-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-full bg-[#111] text-white">
      <canvas ref={canvasRef} className="hidden" />

      {/* Left: Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#050505] relative overflow-hidden star-bg">
         <div className="relative h-full w-full flex items-center justify-center">
             <div 
                ref={containerRef}
                className="relative max-h-[90vh] max-w-[90vw] shadow-[0_0_50px_rgba(147,51,234,0.3)] rounded-lg border-2 border-white/20 bg-gray-900 cursor-move touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
             >
                 {finalImage && (
                     <img src={finalImage} alt="Collage Result" className="h-full w-auto object-contain max-h-[85vh] pointer-events-none select-none" />
                 )}
                 {/* Visual Hint for stickers */}
                 {stickers.length > 0 && (
                     <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white/70 pointer-events-none">
                         Drag stickers to move
                     </div>
                 )}
             </div>
         </div>
      </div>

      {/* Right: Actions */}
      <div className="w-96 bg-[#18181b] border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
         <div>
            <h2 className="text-2xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Decorate
            </h2>
         </div>

         {/* 1. Frames */}
         <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <LayoutTemplate className="w-4 h-4 text-purple-400" /> Frame Overlay
            </label>
            <div className="flex gap-2">
                <button onClick={() => setActiveFrame(FrameType.NONE)} className={`flex-1 py-2 text-xs rounded border ${activeFrame === FrameType.NONE ? 'bg-white text-black' : 'border-gray-600'}`}>None</button>
                <button onClick={() => setActiveFrame(FrameType.COCKPIT)} className={`flex-1 py-2 text-xs rounded border ${activeFrame === FrameType.COCKPIT ? 'bg-cyan-900 border-cyan-500' : 'border-gray-600'}`}>Cockpit</button>
                <button onClick={() => setActiveFrame(FrameType.MAGAZINE)} className={`flex-1 py-2 text-xs rounded border ${activeFrame === FrameType.MAGAZINE ? 'bg-pink-900 border-pink-500' : 'border-gray-600'}`}>Mag</button>
            </div>
         </div>

         {/* 2. Stickers */}
         <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <Sparkles className="w-4 h-4 text-yellow-400" /> Stickers
            </label>
            <div className="flex flex-wrap gap-2">
                {stickerOptions.map(s => (
                    <button 
                        key={s} 
                        onClick={() => addSticker(s)}
                        className="w-10 h-10 bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center justify-center text-xl"
                    >
                        {s.length > 3 ? <span className="text-[8px] font-bold">{s}</span> : s}
                    </button>
                ))}
                <button onClick={() => setStickers([])} className="px-2 py-1 text-xs text-red-400 hover:text-red-300 ml-auto">Clear</button>
            </div>
         </div>

         {/* 3. Caption */}
         <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <Type className="w-4 h-4 text-purple-400" />
                Time Capsule Message
            </label>
            <input 
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={30}
                placeholder="Write your wish..."
                className="w-full bg-white text-black border-2 border-black focus:border-purple-500 outline-none px-4 py-3 rounded-lg font-bold font-space text-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
            />
         </div>

         <div className="flex-1"></div>

         <div className="space-y-4">
             <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xl py-4 rounded-xl shadow-lg transform transition active:scale-95"
            >
                <Download className="w-6 h-6" />
                DOWNLOAD
            </button>

            <button 
                onClick={onRetake}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-bold"
            >
                <RotateCcw className="w-5 h-5" />
                New Mission
            </button>
         </div>
      </div>
    </div>
  );
};
