import React, { useEffect, useState, useRef } from 'react';
import { Trophy, UserX, RefreshCw, UserCheck } from 'lucide-react';
import { Participant, Prize } from '../../types/lottery';

interface RevelationPhaseProps {
  winners: Participant[];
  prize: Prize;
  onComplete: () => void;
  onBackToOverview?: () => void;
  onReset?: () => void;
  onRedraw?: (newWinners: Participant[]) => void;
  availableParticipants?: Participant[];
}

export const RevelationPhase: React.FC<RevelationPhaseProps> = ({ winners, prize, onComplete, onBackToOverview, onReset, onRedraw, availableParticipants = [] }) => {
  const [revealedWinners, setRevealedWinners] = useState<Participant[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [absentWinners, setAbsentWinners] = useState<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const winnersStringRef = useRef<string>('');

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const currentWinnersString = JSON.stringify(winners.map(w => w.id).sort());
    
    if (!hasInitializedRef.current && winners.length > 0) {
      console.log('🎊 RevelationPhase: Starting revelation animation for winners:', winners.map(w => w.name));
      hasInitializedRef.current = true;
      winnersStringRef.current = currentWinnersString;
      
      // Show explosion effect immediately
      setShowExplosion(true);
      
      // Initialize revealed winners immediately to avoid layout shift
      setRevealedWinners(winners);
      
      // Show buttons after 1 second
      const buttonTimer = setTimeout(() => {
        console.log('🎊 RevelationPhase: Showing buttons');
        setShowButtons(true);
        onCompleteRef.current();
      }, 1000);
      
      return () => {
        clearTimeout(buttonTimer);
      };
    } else if (hasInitializedRef.current && winners.length > 0 && winnersStringRef.current === currentWinnersString) {
      console.log('🎊 RevelationPhase: Same winners detected, ensuring buttons are shown');
      // Even if it's the same winners, ensure buttons are shown if they haven't been shown yet
      if (!showButtons) {
        const buttonTimer = setTimeout(() => {
          console.log('🎊 RevelationPhase: Showing buttons (delayed for same winners)');
          setShowButtons(true);
          onCompleteRef.current();
        }, 100);
        
        return () => {
          clearTimeout(buttonTimer);
        };
      }
    } else if (hasInitializedRef.current && winnersStringRef.current !== currentWinnersString) {
      console.log('🎊 RevelationPhase: Different winners detected, but already initialized - this should not happen in normal flow');
    }
  }, [winners, showButtons]);

  const toggleAbsentStatus = (participantId: string) => {
    setAbsentWinners(prev => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  };

  const handleRedraw = () => {
    if (absentWinners.size === 0) {
      alert('請先標記不在場的中獎者！');
      return;
    }

    // 直接在當前頁面重新抽獎
    const presentWinners = revealedWinners.filter(w => !absentWinners.has(w.id));
    
    // 從可用參與者中排除**所有當前中獎者**（包括在場和不在場的），然後隨機選取替代者
    const allCurrentWinnerIds = new Set(revealedWinners.map(w => w.id));
    const filteredParticipants = availableParticipants.filter(p => !allCurrentWinnerIds.has(p.id));

    console.log('🔄 Redraw Debug:', {
      absentWinnersCount: absentWinners.size,
      presentWinnersCount: presentWinners.length,
      allWinnersCount: revealedWinners.length,
      availableParticipantsCount: availableParticipants.length,
      filteredParticipantsCount: filteredParticipants.length
    });

    if (filteredParticipants.length < absentWinners.size) {
      alert(`可重新抽獎人數不足！需要 ${absentWinners.size} 人，目前可抽獎人數：${filteredParticipants.length}`);
      return;
    }
    
    const shuffled = [...filteredParticipants].sort(() => Math.random() - 0.5);
    const newWinners = shuffled.slice(0, absentWinners.size);
    
    console.log('🎯 New winners selected:', newWinners.map(w => w.name));
    
    // 合併在場的中獎者和新抽取的中獎者
    const finalWinners = [...presentWinners, ...newWinners];
    
    // 直接更新中獎者
    setRevealedWinners(finalWinners);
    setAbsentWinners(new Set());
    
    // 通知父組件更新狀態
    onRedraw?.(finalWinners);
  };

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
            {revealedWinners.map((winner, index) => {
              const isAbsent = absentWinners.has(winner.id);
              return (
                <div
                  key={winner.id}
                  className={`bg-white rounded-2xl p-6 shadow-2xl transform transition-all duration-700 hover:scale-105 m-2 relative ${
                    isAbsent ? 'opacity-60 bg-gray-100' : ''
                  }`}
                  style={{
                    animation: `winnerReveal 1s ease-out forwards`,
                    animationDelay: `${index * 0.3}s`,
                    opacity: 0,
                    transform: 'scale(0.3) translateY(100px)'
                  }}
                >
                  {/* 不在場狀態切換按鈕 */}
                  {showButtons && (
                    <button
                      onClick={() => toggleAbsentStatus(winner.id)}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
                        isAbsent 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                      title={isAbsent ? '標記為在場' : '標記為不在場'}
                    >
                      {isAbsent ? <UserX size={20} /> : <UserCheck size={20} />}
                    </button>
                  )}

                  {/* 得獎者名字 - 調整字體大小 */}
                  <div className={`text-4xl md:text-5xl lg:text-6xl font-black ${
                    isAbsent ? 'text-gray-500' : 'text-gray-800'
                  }`}>
                    {winner.name}
                  </div>

                  {/* 不在場標記 */}
                  {isAbsent && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                      不在場
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
        </div>

        {/* Navigation buttons - 固定在底部 */}
        {showButtons && (
          <div className="flex-shrink-0 px-6 pb-8">
            {/* 統計信息 */}
            {absentWinners.size > 0 && (
              <div className="text-center mb-4" style={{animation: 'fadeIn 1s ease-out'}}>
                <div className="bg-yellow-100 border border-yellow-400 rounded-xl p-4 inline-block">
                  <div className="text-lg font-bold text-yellow-800">
                    已標記 {absentWinners.size} 位不在場中獎者
                  </div>
                  <div className="text-sm text-yellow-700">
                    點擊「重新抽獎」來重新抽取這些位置
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style={{animation: 'fadeIn 1s ease-out'}}>
              {/* 重新抽獎按鈕 */}
              {onRedraw && (
                <button
                  onClick={handleRedraw}
                  disabled={absentWinners.size === 0}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-bold text-lg flex items-center gap-2 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <RefreshCw size={20} />
                  重新抽獎 ({absentWinners.size} 位)
                </button>
              )}

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