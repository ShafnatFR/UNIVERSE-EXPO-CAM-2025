import React, { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { CameraInterface } from './components/CameraInterface';
import { ResultPreview } from './components/ResultPreview';
import { AppStep, CollageMode } from './types';

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.SPLASH);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [collageMode, setCollageMode] = useState<CollageMode>(CollageMode.SINGLE);

  const handleStart = () => {
    setStep(AppStep.CAMERA);
  };

  const handleCapture = (images: string[], mode: CollageMode) => {
    setCapturedImages(images);
    setCollageMode(mode);
    setStep(AppStep.RESULT);
  };

  const handleRetake = () => {
    setCapturedImages([]);
    setStep(AppStep.CAMERA);
  };

  return (
    <div className="min-h-screen w-full bg-black flex justify-center overflow-hidden">
      {/* Container Full Screen for Desktop */}
      <div className="w-full h-full relative shadow-2xl">
        {step === AppStep.SPLASH && (
          <SplashScreen onStart={handleStart} />
        )}
        
        {step === AppStep.CAMERA && (
          <CameraInterface onCapture={handleCapture} />
        )}

        {step === AppStep.RESULT && (
          <ResultPreview 
            images={capturedImages}
            collageMode={collageMode}
            onRetake={handleRetake} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
