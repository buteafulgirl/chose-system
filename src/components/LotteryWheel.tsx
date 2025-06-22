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
  const [selectedWinners, setSelectedWinners] = useState<Participant[]>([]);
  const [showProgressiveResults, setShowProgressiveResults] = useState(false);
  const [drawingId, setDrawingId] = useState<string>('');

  useEffect(() => {
    if (!isDrawing || !currentPrize) {
      // 重置狀態
      setCurrentName('');
      setSelectedWinners([]);
      setShowProgressiveResults(false);
      return;
    }

    // 開始抽獎
    const availableParticipants = allowRepeat 
      ? participants 
      : participants.filter(p => !p.isSelected);

    if (availableParticipants.length < currentPrize.drawCount) {
      alert(`⚠️ 抽獎失敗：${currentPrize.name} 需要 ${currentPrize.drawCount} 人，僅有 ${availableParticipants.length} 人可抽。`);
      onDrawComplete([]);
      return;
    }

    // 生成唯一ID
    const drawId = Date.now().toString();
    setDrawingId(drawId);

    // 預選中獎者
    const winners: Participant[] = [];
    const selectedIndices = new Set<number>();
    const drawCount = Math.min(currentPrize.drawCount, availableParticipants.length);

    for (let i = 0; i < drawCount; i++) {
      let randomIndex;
      if (allowRepeat) {
        randomIndex = Math.floor(Math.random() * availableParticipants.length);
        winners.push(availableParticipants[randomIndex]);
      } else {
        let attempts = 0;
        do {
          randomIndex = Math.floor(Math.random() * availableParticipants.length);
          attempts++;
        } while (selectedIndices.has(randomIndex) && attempts < 50);

        if (!selectedIndices.has(randomIndex)) {
          selectedIndices.add(randomIndex);
          winners.push(availableParticipants[randomIndex]);
        }
      }
    }

    // 是否顯示漸進式結果
    const useProgressiveResults = drawCount > 5;
    if (useProgressiveResults) {
      setShowProgressiveResults(true);
    }

    // 動畫參數
    let duration = 0;
    const maxDuration = 3000;
    let revealedCount = 0;
    const winnerRevealInterval = maxDuration / Math.max(drawCount, 1);

    // 開始動畫
    const interval = setInterval(() => {
      // 隨機顯示名字
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      const randomName = availableParticipants[randomIndex]?.name || '';
      setCurrentName(randomName);
      
      duration += 50;

      // 漸進式顯示中獎者
      if (useProgressiveResults && revealedCount < winners.length) {
        const nextRevealTime = (revealedCount + 1) * winnerRevealInterval;
        if (duration >= nextRevealTime) {
          setSelectedWinners(prev => [...prev, winners[revealedCount]]);
          revealedCount++;
        }
      }

      // 完成抽獎
      if (duration >= maxDuration) {
        clearInterval(interval);

        // 確保所有中獎者都顯示
        if (useProgressiveResults && revealedCount < winners.length) {
          setSelectedWinners(winners);
        }

        // 顯示最後中獎者
        if (winners.length > 0) {
          setCurrentName(winners[winners.length - 1].name);
        }

        // 完成回調
        setTimeout(() => {
          onDrawComplete(winners);
        }, 500);
      }
    }, 50);

    // 清理函數
    return () => {
      clearInterval(interval);
    };
  }, [isDrawing, currentPrize, participants, allowRepeat, onDrawComplete]);

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
                key={`${drawingId}-${winner.id}-${index}`}
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
