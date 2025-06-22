import React, { useState, useEffect } from 'react';
import { Participant, Prize } from '../types/lottery';

interface LotteryWheelProps {
  participants: Participant[];
  isDrawing: boolean;
  onDrawComplete: (winners: Participant[]) => void;
  currentPrize: Prize | null;
  allowRepeat: boolean;
}

export const LotteryWheel: React.FC<LotteryWheelProps> = ({
  participants,
  isDrawing,
  onDrawComplete,
  currentPrize,
  allowRepeat
}) => {
  const [currentName, setCurrentName] = useState('');
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [selectedWinners, setSelectedWinners] = useState<Participant[]>([]);
  const [showProgressiveResults, setShowProgressiveResults] = useState(false);

  useEffect(() => {
    if (!isDrawing || !currentPrize) {
      setSelectedWinners([]);
      setShowProgressiveResults(false);
      return;
    }

    let interval: NodeJS.Timeout;
    let duration = 0;
    const maxDuration = 5000; // Fixed 5 seconds maximum
    const winners: Participant[] = [];
    const availableParticipants = allowRepeat 
      ? participants 
      : participants.filter(p => !p.isSelected);
    
    // Pre-select all winners with proper logic
    const selectedIndices = new Set<number>();
    const drawCount = Math.min(currentPrize.drawCount, availableParticipants.length);
    
    // Fix: Ensure we don't draw more than available participants
    for (let i = 0; i < drawCount; i++) {
      let randomIndex;
      let attempts = 0;
      const maxAttempts = availableParticipants.length * 2; // Prevent infinite loop
      
      do {
        randomIndex = Math.floor(Math.random() * availableParticipants.length);
        attempts++;
      } while (
        !allowRepeat && 
        selectedIndices.has(randomIndex) && 
        attempts < maxAttempts &&
        selectedIndices.size < availableParticipants.length
      );
      
      // If we can't find a unique participant and repeat is not allowed, break
      if (!allowRepeat && selectedIndices.has(randomIndex) && selectedIndices.size >= availableParticipants.length) {
        break;
      }
      
      selectedIndices.add(randomIndex);
      winners.push(availableParticipants[randomIndex]);
    }

    // Show progressive results for more than 5 winners
    if (drawCount > 5) {
      setShowProgressiveResults(true);
    }

    let currentWinnerIndex = 0;
    const winnerRevealInterval = maxDuration / Math.max(drawCount, 1);

    const animate = () => {
      interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * participants.length);
        setCurrentName(participants[randomIndex]?.name || '');
        
        duration += animationSpeed;
        
        // Gradually slow down
        if (duration > maxDuration * 0.6) {
          setAnimationSpeed(prev => Math.min(prev + 15, 150));
        }

        // Progressive winner reveal for more than 5 winners
        if (showProgressiveResults && currentWinnerIndex < winners.length) {
          const revealTime = (currentWinnerIndex + 1) * winnerRevealInterval;
          if (duration >= revealTime) {
            setSelectedWinners(prev => [...prev, winners[currentWinnerIndex]]);
            currentWinnerIndex++;
          }
        }
        
        if (duration >= maxDuration) {
          clearInterval(interval);
          
          // Show final winner in the wheel
          if (winners.length > 0) {
            setCurrentName(winners[winners.length - 1].name);
          }
          
          // Complete the drawing
          setTimeout(() => {
            onDrawComplete(winners);
          }, 500);
        }
      }, animationSpeed);
    };

    animate();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDrawing, participants, currentPrize, allowRepeat, animationSpeed, onDrawComplete, showProgressiveResults]);

  useEffect(() => {
    if (isDrawing) {
      setAnimationSpeed(50);
    }
  }, [isDrawing]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      {/* Main lottery wheel */}
      <div className="relative">
        <div className={`
          text-4xl md:text-6xl font-bold text-center p-6 rounded-2xl
          ${isDrawing 
            ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white animate-pulse shadow-2xl' 
            : 'bg-white text-gray-800 shadow-lg'
          }
          transition-all duration-300 min-w-[250px] md:min-w-[350px]
        `}>
          {currentName || '準備抽獎'}
        </div>
        
        {isDrawing && (
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl opacity-20 animate-ping"></div>
        )}
      </div>

      {/* Progressive results display for more than 5 winners */}
      {showProgressiveResults && selectedWinners.length > 0 && currentPrize && (
        <div className="w-full max-w-6xl">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">
              已抽中名單 ({selectedWinners.length}/{currentPrize.drawCount})
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {selectedWinners.map((winner, index) => (
              <div
                key={`${winner.id}-${index}`}
                className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
                style={{ 
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="text-lg font-bold text-gray-800 text-center">
                  {winner.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};