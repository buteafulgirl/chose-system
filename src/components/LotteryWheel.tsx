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

    const availableParticipants = allowRepeat 
      ? participants 
      : participants.filter(p => !p.isSelected);

    if (availableParticipants.length < currentPrize.drawCount) {
      alert(`⚠️ 抽獎失敗：${currentPrize.name} 需要 ${currentPrize.drawCount} 人，僅有 ${availableParticipants.length} 人可抽。`);
      onDrawComplete([]);
      return;
    }

    let duration = 0;
    const maxDuration = 5000;
    const winners: Participant[] = [];
    const selectedIndices = new Set<number>();
    const drawCount = allowRepeat 
      ? currentPrize.drawCount 
      : Math.min(currentPrize.drawCount, availableParticipants.length);

    console.log(`🎲 獎品: ${currentPrize.name}, 預計中獎人數: ${drawCount}`);

    for (let i = 0; i < drawCount; i++) {
      let randomIndex;
      if (allowRepeat) {
        randomIndex = Math.floor(Math.random() * availableParticipants.length);
        winners.push(availableParticipants[randomIndex]);
      } else {
        let attempts = 0;
        const maxAttempts = availableParticipants.length * 2;
        do {
          randomIndex = Math.floor(Math.random() * availableParticipants.length);
          attempts++;
        } while (
          selectedIndices.has(randomIndex) &&
          attempts < maxAttempts &&
          selectedIndices.size < availableParticipants.length
        );

        if (!selectedIndices.has(randomIndex)) {
          selectedIndices.add(randomIndex);
          winners.push(availableParticipants[randomIndex]);
        }
      }
    }

    console.log(`🏆 預選中獎者: ${winners.length} 人`);

    if (drawCount > 5) {
      setShowProgressiveResults(true);
    }

    let currentWinnerIndex = 0;
    const winnerRevealInterval = maxDuration / Math.max(drawCount, 1);

    const interval = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      setCurrentName(availableParticipants[randomIndex]?.name || '');
      duration += animationSpeed;

      if (duration > maxDuration * 0.6) {
        setAnimationSpeed(prev => Math.min(prev + 15, 150));
      }

      if (showProgressiveResults && currentWinnerIndex < winners.length) {
        const revealTime = (currentWinnerIndex + 1) * winnerRevealInterval;
        
        if (duration >= revealTime) {
          console.log(`🎊 Revealing winner ${currentWinnerIndex + 1}/${winners.length}:`, winners[currentWinnerIndex]?.name);
          setSelectedWinners(prev => {
            const newList = [...prev, winners[currentWinnerIndex]];
            console.log(`📊 Current displayed winners: ${newList.length}/${winners.length}`);
            return newList;
          });
          currentWinnerIndex++;
        }
      }

      const allWinnersRevealed = showProgressiveResults ? currentWinnerIndex >= winners.length : true;

      if (duration >= maxDuration || (showProgressiveResults && allWinnersRevealed && duration >= maxDuration * 0.8)) {
        console.log(`🎉 抽獎完成! 實際中獎人數: ${winners.length}`);
        clearInterval(interval);

        if (showProgressiveResults && currentWinnerIndex < winners.length) {
          setSelectedWinners(winners);
        }

        if (winners.length > 0) {
          setCurrentName(winners[winners.length - 1].name);
        }

        setTimeout(() => {
          onDrawComplete(winners);
        }, 500);
      }
    }, animationSpeed);

    return () => {
      clearInterval(interval);
    };
  }, [isDrawing, participants, currentPrize, allowRepeat, onDrawComplete, animationSpeed, showProgressiveResults]);

  useEffect(() => {
    if (isDrawing) {
      setAnimationSpeed(50);
    }
  }, [isDrawing]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
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

      {showProgressiveResults && selectedWinners.length > 0 && currentPrize && (
        <div className="w-full max-w-6xl">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">
              已抽中名單 ({selectedWinners.length}/{currentPrize.drawCount})
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {selectedWinners.map((winner, index) => winner && (
              <div
                key={`${winner.id}-${index}`}
                className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
              >
                <div className="text-lg font-bold text-gray-800 text-center">
                  {winner.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
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
