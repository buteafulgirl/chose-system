import React, { useEffect, useState, useRef } from 'react';
import { Trophy } from 'lucide-react';
import { Participant, Prize } from '../../types/lottery';

interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  size: number;
}

interface RevelationPhaseProps {
  winners: Participant[];
  prize: Prize;
  onComplete?: () => void;
  onBackToOverview?: () => void;
  onReset?: () => void;
}

export const RevelationPhase: React.FC<RevelationPhaseProps> = ({ winners, prize, onComplete, onBackToOverview, onReset }) => {
  const [revealedWinners, setRevealedWinners] = useState<Participant[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Show explosion effect immediately
    setShowExplosion(true);
    
    // If we have navigation buttons, we're in celebrating phase - show celebration immediately
    if (onBackToOverview && onReset) {
      console.log('🎊 RevelationPhase: In celebrating phase, showing winners and buttons immediately');
      setRevealedWinners(winners);
      setShowCelebration(true);
      
      // Initialize confetti
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
      const initialConfetti: Confetti[] = [...Array(100)].map((_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: 4 + Math.random() * 8
      }));
      setConfetti(initialConfetti);
      // 不要return，讓組件繼續顯示直到用戶按按鈕
    } else {
      // We're in revealing phase - reveal winners one by one
      const revealTimers: number[] = [];
      
      winners.forEach((winner, i) => {
        const delay = i === 0 ? 1000 : 1000 + (i * 800);
        const timer = setTimeout(() => {
          setRevealedWinners(prev => [...prev, winner]);
        }, delay);
        revealTimers.push(timer);
      });
      
      // Call onComplete to transition to celebrating phase after all winners are revealed
      const totalRevealTime = winners.length === 0 ? 1000 : 1000 + (winners.length - 1) * 800;
      const completeTimer = setTimeout(() => {
        if (onCompleteRef.current) {
          console.log('🎊 RevelationPhase: Calling onComplete to transition to celebrating phase');
          onCompleteRef.current();
        }
      }, totalRevealTime + 2000);
      
      return () => {
        revealTimers.forEach(timer => clearTimeout(timer));
        clearTimeout(completeTimer);
      };
    }
  }, [winners, onBackToOverview, onReset]);

  // Animate confetti
  useEffect(() => {
    if (!showCelebration) return;
    
    const animationInterval = setInterval(() => {
      setConfetti(prevConfetti => 
        prevConfetti.map(piece => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          rotation: piece.rotation + 5,
          vy: piece.vy + 0.1, // gravity
        })).filter(piece => piece.y < window.innerHeight + 50)
      );
    }, 50);

    return () => {
      clearInterval(animationInterval);
    };
  }, [showCelebration]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
      {/* Falling confetti */}
      {showCelebration && confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute pointer-events-none"
          style={{
            left: piece.x,
            top: piece.y,
            transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`, 
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
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
        
        {/* Celebration message and navigation buttons */}
        {showCelebration && (
          <div className="animate-fadeIn">
            <div className="text-4xl md:text-5xl lg:text-6xl text-white font-bold animate-pulse mb-8">
              ✨ 感謝大家的參與！✨
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => {
                  console.log('🔄 RevelationPhase: Back to Overview button clicked');
                  console.log('🔄 onBackToOverview function:', onBackToOverview);
                  if (onBackToOverview) {
                    onBackToOverview();
                  } else {
                    console.error('❌ onBackToOverview is not defined');
                  }
                }}
                className="px-12 py-6 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold flex items-center gap-3 shadow-lg transform hover:scale-105 text-2xl md:text-3xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                回到抽獎總覽
              </button>
              
              <button
                onClick={() => {
                  console.log('🔄 RevelationPhase: Reset button clicked');
                  console.log('🔄 onReset function:', onReset);
                  if (onReset) {
                    onReset();
                  } else {
                    console.error('❌ onReset is not defined');
                  }
                }}
                className="px-12 py-6 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center gap-3 shadow-lg transform hover:scale-105 text-2xl md:text-3xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                  <path d="m15.5 3.5-1.5 1.5m0 0L12.5 3.5M1 12h6m6 0h6"/>
                  <path d="m20.5 20.5-1.5-1.5m0 0 1.5-1.5M3.5 20.5l1.5-1.5m0 0-1.5-1.5"/>
                </svg>
                重新設定
              </button>
            </div>
          </div>
        )}
        
        {/* 如果沒有得獎者 */}
        {revealedWinners.length === 0 && showExplosion && (
          <div className="text-5xl md:text-6xl lg:text-7xl text-white font-bold animate-pulse">
            準備揭曉得獎者...
          </div>
        )}
      </div>

      {/* Floating particles */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div className="w-6 h-6 bg-white rounded-full opacity-60" />
            </div>
          ))}
        </div>
      )}

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