import React from 'react';
import { Rocket } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black star-bg">
      <div className="text-center space-y-6 p-6 max-w-md w-full animate-fade-in-up">
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 animate-pulse"></div>
          <div className="relative bg-black rounded-full p-6 border-2 border-white/20">
            <Rocket className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-space font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          UniVerse Cam
        </h1>
        
        <p className="text-gray-300 text-lg font-light">
          Universe Expo 2025
        </p>

        <div className="pt-8">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-fuchsia-600 to-purple-600 font-space rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 hover:scale-105 active:scale-95 w-full shadow-[0_0_20px_rgba(192,38,211,0.5)]"
          >
            Start Mission
            <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-xs text-gray-500">
        Powered by Universe Expo Tech
      </div>
    </div>
  );
};
