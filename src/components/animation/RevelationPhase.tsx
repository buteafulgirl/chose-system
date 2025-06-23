import React, { useEffect, useState, useRef } from 'react';
import { Trophy } from 'lucide-react';
import { Participant, Prize } from '../../types/lottery';

interface RevelationPhaseProps {
  winners: Participant[];
  prize: Prize;
  onComplete: () => void;
  onBackToOverview?: () => void;
  onReset?: () => void;
}

export const RevelationPhase: React.FC<RevelationPhaseProps> = ({ winners, prize, onComplete, onBackToOverview, onReset }) => {
  const [revealedWinners, setRevealedWinners] = useState<Participant[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
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
    
    // Show buttons after all winners are revealed + 2 seconds, then call onComplete
    const totalRevealTime = winners.length === 0 ? 1000 : 1000 + (winners.length - 1) * 800;
    const buttonTimer = setTimeout(() => {
      console.log('🎊 RevelationPhase: All winners revealed, showing buttons');
      setShowButtons(true);
      onCompleteRef.current();
    }, totalRevealTime + 2000);
    
    return () => {
      revealTimers.forEach(timer => clearTimeout(timer));
      clearTimeout(buttonTimer);
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

      {/* 主要內容 - 使用 flex 布局 */}
      <div className="relative z-10 h-full flex flex-col">
        {/* 獎項標題 - 固定在頂部 */}
        <div className="flex-shrink-0 text-center px-6 pt-8 mb-6">
          <div className="flex items-center justify-center mb-4">
            <Trophy size={60} className="text-yellow-200 mr-4" />
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-lg">
              {prize.name}
            </h2>
            <Trophy size={60} className="text-yellow-200 ml-4" />
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl text-yellow-100 font-bold">
            恭喜得獎者
          </div>
        </div>

        {/* 得獎者卡片 - 可滾動區域 */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto p-4">
            {revealedWinners.map((winner, index) => (
              <div
                key={winner.id}
                className="bg-white rounded-2xl p-6 shadow-2xl transform transition-all duration-700 hover:scale-105 m-2"
                style={{
                  animation: `winnerReveal 1s ease-out forwards`,
                  animationDelay: `${index * 0.3}s`,
                  opacity: 0,
                  transform: 'scale(0.3) translateY(100px)'
                }}
              >
                {/* 得獎者名字 - 調整字體大小 */}
                <div className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800">
                  {winner.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* 如果沒有得獎者 */}
          {revealedWinners.length === 0 && showExplosion && (
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl text-white font-bold animate-pulse">
                準備揭曉得獎者...
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons - 固定在底部 */}
        {showButtons && (onBackToOverview || onReset) && (
          <div className="flex-shrink-0 px-6 pb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style={{animation: 'fadeIn 1s ease-out'}}>
              {onBackToOverview && (
                <button
                  onClick={() => {
                    console.log('🔄 RevelationPhase: Back to Overview button clicked');
                    onBackToOverview();
                  }}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-bold text-lg flex items-center gap-2 shadow-lg transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19-7-7 7-7"/>
                    <path d="M19 12H5"/>
                  </svg>
                  回到抽獎總覽
                </button>
              )}
              
              {onReset && (
                <button
                  onClick={() => {
                    console.log('🔄 RevelationPhase: Reset button clicked');
                    onReset();
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-bold text-lg flex items-center gap-2 shadow-lg transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="m15.5 3.5-1.5 1.5m0 0L12.5 3.5M1 12h6m6 0h6"/>
                    <path d="m20.5 20.5-1.5-1.5m0 0 1.5-1.5M3.5 20.5l1.5-1.5m0 0-1.5-1.5"/>
                  </svg>
                  重新設定
                </button>
              )}
            </div>
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
              transform: scale(1.05) translateY(-5px);
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

      {/* 固定在右下角的魔法師圖標 - 佔據螢幕20% */}
      <div className="fixed bottom-4 right-4 z-60">
        <img 
          src="/aMI_magician.svg" 
          alt="Magician"
          className="w-[20vw] h-[20vh] object-contain drop-shadow-lg opacity-80"
        />
      </div>
    </div>
  );
};