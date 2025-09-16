/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, ImageIcon, UploadCloudIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  availablePoseKeys: string[];
  onBackgroundChange: (prompt: string) => void;
  onBackgroundImageUpload: (file: File) => void;
  onCustomPoseGenerate: (prompt: string) => void;
}

const PRESET_BACKGROUNDS = [
  "A bustling city street at golden hour",
  "A serene beach with white sand and clear water",
  "A minimalist studio with soft lighting",
  "A lush, green forest with dappled sunlight",
  "A futuristic neon-lit cityscape at night",
  "A cozy, rustic library with bookshelves"
];


const Canvas: React.FC<CanvasProps> = ({ displayImageUrl, onStartOver, isLoading, loadingMessage, onSelectPose, poseInstructions, currentPoseIndex, availablePoseKeys, onBackgroundChange, onBackgroundImageUpload, onCustomPoseGenerate }) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);
  const [customBgPrompt, setCustomBgPrompt] = useState('');
  const [customPosePrompt, setCustomPosePrompt] = useState('');

  const handleCustomBgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBgPrompt.trim() && !isLoading) {
        onBackgroundChange(customBgPrompt.trim());
        setIsBgMenuOpen(false);
        setCustomBgPrompt('');
    }
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            // Should provide feedback to user, but for now this is fine.
            return;
        }
        onBackgroundImageUpload(file);
        setIsBgMenuOpen(false); // Close menu after selection
    }
    // Reset file input value to allow selecting the same file again
    if (e.target) {
        e.target.value = '';
    }
  };
  
  const handleCustomPoseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPosePrompt.trim() && !isLoading) {
        onCustomPoseGenerate(customPosePrompt.trim());
        setIsPoseMenuOpen(false);
        setCustomPosePrompt('');
    }
  };

  const handlePreviousPose = () => {
    if (isLoading || availablePoseKeys.length <= 1) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);
    
    // Fallback if current pose not in available list (shouldn't happen)
    if (currentIndexInAvailable === -1) {
        onSelectPose((currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length);
        return;
    }

    const prevIndexInAvailable = (currentIndexInAvailable - 1 + availablePoseKeys.length) % availablePoseKeys.length;
    const prevPoseInstruction = availablePoseKeys[prevIndexInAvailable];
    const newGlobalPoseIndex = poseInstructions.indexOf(prevPoseInstruction);
    
    if (newGlobalPoseIndex !== -1) {
        onSelectPose(newGlobalPoseIndex);
    }
  };

  const handleNextPose = () => {
    if (isLoading) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);

    // Fallback or if there are no generated poses yet
    if (currentIndexInAvailable === -1 || availablePoseKeys.length === 0) {
        onSelectPose((currentPoseIndex + 1) % poseInstructions.length);
        return;
    }
    
    const nextIndexInAvailable = currentIndexInAvailable + 1;
    if (nextIndexInAvailable < availablePoseKeys.length) {
        // There is another generated pose, navigate to it
        const nextPoseInstruction = availablePoseKeys[nextIndexInAvailable];
        const newGlobalPoseIndex = poseInstructions.indexOf(nextPoseInstruction);
        if (newGlobalPoseIndex !== -1) {
            onSelectPose(newGlobalPoseIndex);
        }
    } else {
        // At the end of generated poses, generate the next one from the master list
        const newGlobalPoseIndex = (currentPoseIndex + 1) % poseInstructions.length;
        onSelectPose(newGlobalPoseIndex);
    }
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative animate-zoom-in group">
      {/* Start Over Button */}
      <button 
          onClick={onStartOver}
          className="absolute top-4 left-4 z-30 flex items-center justify-center text-center bg-white/60 border border-gray-300/80 text-gray-700 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:border-gray-400 active:scale-95 text-sm backdrop-blur-sm"
      >
          <RotateCcwIcon className="w-4 h-4 mr-2" />
          Start Over
      </button>

      {/* Image Display or Placeholder */}
      <div className="relative w-full h-full flex items-center justify-center">
        {displayImageUrl ? (
          <motion.img
            key={displayImageUrl} // Use key to force re-render and trigger animation on image change
            src={displayImageUrl}
            alt="Virtual try-on model"
            className="max-w-full max-h-full object-contain transition-opacity duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
            <div className="w-[400px] h-[600px] bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
              <Spinner />
              <p className="text-md font-serif text-gray-600 mt-4">Loading Model...</p>
            </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Spinner />
                  {loadingMessage && (
                      <p className="text-lg font-serif text-gray-700 mt-4 text-center px-4">{loadingMessage}</p>
                  )}
              </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {displayImageUrl && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {/* Background Control */}
          <div 
            className="relative"
            onMouseEnter={() => setIsBgMenuOpen(true)}
            onMouseLeave={() => setIsBgMenuOpen(false)}
          >
            <AnimatePresence>
                {isBgMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full mb-3 -left-1/2 translate-x-[10%] w-72 bg-white/80 backdrop-blur-lg rounded-xl p-3 border border-gray-200/80 shadow-lg"
                    >
                        <h3 className="text-sm font-semibold text-gray-800 px-1 pb-2">Change Background</h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {PRESET_BACKGROUNDS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => onBackgroundChange(prompt)}
                                    disabled={isLoading}
                                    className="w-full text-left text-xs font-medium text-gray-800 p-2 rounded-md hover:bg-gray-200/70 disabled:opacity-50"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                        <div className="pt-2 border-t border-gray-200/80 space-y-2">
                            <form onSubmit={handleCustomBgSubmit} className="flex items-center gap-2">
                                <input 
                                    type="text"
                                    value={customBgPrompt}
                                    onChange={(e) => setCustomBgPrompt(e.target.value)}
                                    placeholder="Or type a custom one..."
                                    disabled={isLoading}
                                    className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-800 focus:outline-none disabled:bg-gray-100"
                                />
                                <button type="submit" aria-label="Generate custom background" disabled={isLoading} className="flex-shrink-0 p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-500">
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </form>
                             <label htmlFor="background-image-upload" className={`w-full relative flex items-center justify-center px-4 py-2 text-xs font-medium text-center text-gray-800 bg-gray-200/70 rounded-md transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300/80 cursor-pointer'}`}>
                                <UploadCloudIcon className="w-4 h-4 mr-2" />
                                Upload Background
                            </label>
                            <input 
                                id="background-image-upload" 
                                type="file" 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" 
                                onChange={handleBgFileChange} 
                                disabled={isLoading}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <button
                aria-label="Change background"
                className="p-3.5 rounded-full bg-white/60 backdrop-blur-md border border-gray-300/50 hover:bg-white/80 active:scale-90 transition-all"
            >
                <ImageIcon className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          {/* Pose Controls */}
          <div 
            className="relative"
            onMouseEnter={() => setIsPoseMenuOpen(true)}
            onMouseLeave={() => setIsPoseMenuOpen(false)}
          >
            <AnimatePresence>
                {isPoseMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full mb-3 w-72 bg-white/80 backdrop-blur-lg rounded-xl p-3 border border-gray-200/80 shadow-lg"
                    >
                        <h3 className="text-sm font-semibold text-gray-800 px-1 pb-2">Change Pose</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                            {poseInstructions.map((pose, index) => (
                                <button
                                    key={pose}
                                    onClick={() => onSelectPose(index)}
                                    disabled={isLoading || index === currentPoseIndex}
                                    className="w-full text-left text-sm font-medium text-gray-800 p-2 rounded-md hover:bg-gray-200/70 disabled:opacity-50 disabled:bg-gray-200/70 disabled:font-bold disabled:cursor-not-allowed"
                                >
                                    {pose}
                                </button>
                            ))}
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-200/80">
                            <form onSubmit={handleCustomPoseSubmit} className="flex items-center gap-2">
                                <input 
                                    type="text"
                                    value={customPosePrompt}
                                    onChange={(e) => setCustomPosePrompt(e.target.value)}
                                    placeholder="Or describe a custom pose..."
                                    disabled={isLoading}
                                    className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-800 focus:outline-none disabled:bg-gray-100"
                                />
                                <button type="submit" aria-label="Generate custom pose" disabled={isLoading || !customPosePrompt.trim()} className="flex-shrink-0 p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-500">
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-md rounded-full p-2 border border-gray-300/50">
              <button 
                onClick={handlePreviousPose}
                aria-label="Previous pose"
                className="p-2 rounded-full hover:bg-white/80 active:scale-90 transition-all disabled:opacity-50"
                disabled={isLoading}
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
              </button>
              <span className="text-sm font-semibold text-gray-800 w-48 text-center truncate" title={poseInstructions[currentPoseIndex]}>
                {poseInstructions[currentPoseIndex]}
              </span>
              <button 
                onClick={handleNextPose}
                aria-label="Next pose"
                className="p-2 rounded-full hover:bg-white/80 active:scale-90 transition-all disabled:opacity-50"
                disabled={isLoading}
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;