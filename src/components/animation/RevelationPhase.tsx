import React, { useEffect, useState, useRef } from 'react';
import { Trophy } from 'lucide-react';
import { Participant, Prize } from '../../types/lottery';

interface RevelationPhaseProps {
  winners: Participant[];
  prize: Prize;
  onComplete: () => void;
}

export const RevelationPhase: React.FC<RevelationPhaseProps> = ({ winners, prize, onComplete }) => {
  const [revealedWinners, setRevealedWinners] = useState<Participant[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    console.log('🎊 RevelationPhase: Starting revelation animation');
    // Show explosion effect immediately
    setShowExplosion(true);
    
    // Reveal winners one by one
    const revealTimers: number[] = [];
    
    winners.forEach((winner, i) => {
      const delay = i === 0 ? 1000 : 1000 + (i * 800);
      const timer = setTimeout(() => {
        setRevealedWinners(prev => [...prev, winner]);
      }, delay);
      revealTimers.push(timer);
    });
    
    // Call onComplete after all winners are revealed + 2 seconds
    const totalRevealTime = winners.length === 0 ? 1000 : 1000 + (winners.length - 1) * 800;
    const completeTimer = setTimeout(() => {
      console.log('🎊 RevelationPhase: All winners revealed, calling onComplete');
      onCompleteRef.current();
    }, totalRevealTime + 2000);
    
    return () => {
      revealTimers.forEach(timer => clearTimeout(timer));
      clearTimeout(completeTimer);
    };
  }, [winners]);


  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
      {/* 簡化的背景光芒效果 */}
      {showExplosion && (
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-gradient-to-r from-yellow-200 to-transparent"
              style={{
                height: '40%',
                left: '50%',
                top: '50%',
                transformOrigin: 'bottom',
                transform: `rotate(${i * 45}deg)`,
                animation: `expand 1.5s ease-out forwards`
              }}
            />
          ))}
        </div>
      )}

      {/* 主要內容 */}
      <div className="relative z-10 text-center mx-auto px-6">
        {/* 獎項標題 */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <Trophy size={80} className="text-yellow-200 mr-6" />
            <h2 className="text-8xl md:text-9xl lg:text-[10rem] font-black text-white drop-shadow-lg">
              {prize.name}
            </h2>
            <Trophy size={80} className="text-yellow-200 ml-6" />
          </div>
          <div className="text-5xl md:text-6xl lg:text-7xl text-yellow-100 font-bold">
            🎊 恭喜得獎者 🎊
          </div>
        </div>

        {/* 得獎者卡片 - 更大尺寸 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-8 max-w-8xl mx-auto px-4">
          {revealedWinners.map((winner, index) => (
            <div
              key={winner.id}
              className="bg-white rounded-2xl p-8 shadow-2xl transform transition-all duration-700 hover:scale-105"
              style={{
                animation: `winnerReveal 1s ease-out forwards`,
                animationDelay: `${index * 0.3}s`,
                opacity: 0,
                transform: 'scale(0.3) translateY(100px)'
              }}
            >
              {/* 得獎者名字 - 超大字體 */}
              <div className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-800 mb-4">
                {winner.name}
              </div>
            </div>
          ))}
        </div>
        
        
        {/* 如果沒有得獎者 */}
        {revealedWinners.length === 0 && showExplosion && (
          <div className="text-5xl md:text-6xl lg:text-7xl text-white font-bold animate-pulse">
            準備揭曉得獎者...
          </div>
        )}
      </div>


      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes expand {
            0% { height: 0; opacity: 1; }
            100% { height: 40%; opacity: 0.6; }
          }
          
          @keyframes winnerReveal {
            0% {
              opacity: 0;
              transform: scale(0.3) translateY(100px);
            }
            60% {
              transform: scale(1.1) translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `
      }} />
    </div>
  );
};