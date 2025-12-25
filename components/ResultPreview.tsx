import React, { useState, useRef, useEffect } from 'react';
import { Download, Share2, RotateCcw, Type } from 'lucide-react';
import { CollageMode } from '../types';

interface ResultPreviewProps {
  images: string[];
  collageMode: CollageMode;
  onRetake: () => void;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({ images, collageMode, onRetake }) => {
  const [caption, setCaption] = useState('');
  const [finalImage, setFinalImage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (images.length === 0) return;

    const stitchImages = async () => {
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
      
      // Determine Canvas Size based on Collage Mode
      let finalW = baseWidth;
      let finalH = baseHeight;

      if (collageMode === CollageMode.GRID_2X2) {
          finalW = baseWidth * 2;
          finalH = baseHeight * 2;
      } else if (collageMode === CollageMode.STRIP_3) {
          finalH = baseHeight * 3;
      }

      canvas.width = finalW;
      canvas.height = finalH;

      // Fill Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, finalW, finalH);

      // Draw Images
      loadedImages.forEach((img, i) => {
          let x = 0, y = 0;
          if (collageMode === CollageMode.SINGLE) {
              x = 0; y = 0;
          } else if (collageMode === CollageMode.GRID_2X2) {
              x = (i % 2) * baseWidth;
              y = Math.floor(i / 2) * baseHeight;
          } else if (collageMode === CollageMode.STRIP_3) {
              x = 0;
              y = i * baseHeight;
          }
          ctx.drawImage(img, x, y, baseWidth, baseHeight);
          
          // Add border between images for style
          if(collageMode !== CollageMode.SINGLE) {
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 10;
              ctx.strokeRect(x, y, baseWidth, baseHeight);
          }
      });

      // Add Watermark / Footer
      ctx.save();
      const fontSize = Math.floor(finalW * 0.05);
      ctx.font = `bold ${fontSize}px Orbitron`;
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 10;
      ctx.textAlign = 'right';
      ctx.fillText("UniVerse 2025", finalW - 40, finalH - 40);
      ctx.restore();

      // Add Caption (Time Capsule)
      if (caption.trim()) {
          ctx.save();
          const capSize = Math.floor(finalW * 0.06);
          ctx.font = `bold ${capSize}px Orbitron`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.shadowColor = '#d946ef'; // Neon glow
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#ffffff';
          // Position at bottom center
          ctx.fillText(caption, finalW / 2, finalH - (fontSize * 2));
          ctx.restore();
      }

      setFinalImage(canvas.toDataURL('image/png'));
    };

    // Debounce
    const t = setTimeout(stitchImages, 500);
    return () => clearTimeout(t);

  }, [images, collageMode, caption]);

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
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Left: Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#050505] relative overflow-hidden star-bg">
         <div className="relative h-full max-h-[90vh] shadow-[0_0_50px_rgba(147,51,234,0.3)] rounded-lg overflow-hidden border-2 border-white/20 bg-gray-900">
             {finalImage && (
                 <img src={finalImage} alt="Collage Result" className="h-full w-auto object-contain" />
             )}
         </div>
      </div>

      {/* Right: Actions */}
      <div className="w-96 bg-[#18181b] border-l border-white/10 p-8 flex flex-col gap-6">
         <div>
            <h2 className="text-3xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Mission Complete
            </h2>
            <p className="text-gray-400 mt-2">Your cosmic memory is ready.</p>
         </div>

         <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <Type className="w-4 h-4 text-purple-400" />
                Time Capsule Message
            </label>
            <input 
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={40}
                placeholder="Write your wish..."
                className="w-full bg-white text-black border-2 border-black focus:border-purple-500 outline-none px-4 py-3 rounded-lg font-bold font-space text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
            />
         </div>

         <div className="flex-1"></div>

         <div className="space-y-4">
             <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xl py-5 rounded-xl shadow-lg transform transition active:scale-95"
            >
                <Download className="w-6 h-6" />
                DOWNLOAD PHOTO
            </button>

            <div className="flex gap-4">
                <button 
                    onClick={onRetake}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-bold"
                >
                    <RotateCcw className="w-5 h-5" />
                    New Mission
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};
