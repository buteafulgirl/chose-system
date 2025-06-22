import React from 'react';

interface MagicianAnimationProps {
  isVisible: boolean;
}

export const MagicianAnimation: React.FC<MagicianAnimationProps> = ({ isVisible }) => {
  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
      isVisible ? 'w-[40vw] h-[40vh] max-w-[400px] max-h-[400px]' : 'w-48 h-56'
    }`}>
      <div className={`w-full h-full ${isVisible ? 'animate-bounce' : ''}`}>
        {isVisible ? (
          // Use GIF during drawing
          <img 
            src="/Mi動畫.gif" 
            alt="Magic Animation"
            className="w-full h-full object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback to SVG if GIF is not available
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const nextSibling = target.nextElementSibling as HTMLElement;
              if (nextSibling) {
                nextSibling.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        
        {/* SVG Magician - shown when not drawing or as fallback */}
        <img 
          src="/aMI_magician.svg" 
          alt="Magician"
          className={`w-full h-full object-contain drop-shadow-lg ${isVisible ? 'hidden' : ''}`}
        />
      </div>
    </div>
  );
};