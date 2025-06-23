import React, { useEffect, useState } from 'react';
import { PartyPopper, Gift, Crown } from 'lucide-react';
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

interface CelebrationPhaseProps {
  winners: Participant[];
  prize: Prize;
  onBackToOverview: () => void;
  onReset: () => void;
}

export const CelebrationPhase: React.FC<CelebrationPhaseProps> = ({ 
  winners, 
  prize, 
  onBackToOverview, 
  onReset 
}) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    console.log('🎊 CelebrationPhase: Component mounted');
    
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
    setTimeout(() => setShowContent(true), 300);
  }, []);

  // Animate confetti
  useEffect(() => {
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
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
      {/* Falling confetti */}
      {confetti.map(piece => (
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

      {/* Main content */}
      {showContent && (
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 animate-fadeIn">
          {/* Celebration header */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <PartyPopper size={64} className="text-yellow-300 mr-4 animate-bounce" />
              <h1 className="text-6xl font-bold text-white">
                🎊 恭喜 🎊
              </h1>
              <PartyPopper size={64} className="text-yellow-300 ml-4 animate-bounce" />
            </div>
            
            <div className="text-3xl text-yellow-200 mb-4">
              {prize.name} 抽獎圓滿結束！
            </div>
          </div>

          {/* Winners showcase */}
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl mb-8">
            <div className="flex items-center justify-center mb-6">
              <Crown size={32} className="text-yellow-600 mr-2" />
              <h2 className="text-4xl font-bold text-gray-800">得獎名單</h2>
              <Crown size={32} className="text-yellow-600 ml-2" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((winner, index) => (
                <div
                  key={winner.id}
                  className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105"
                  style={{
                    animation: `slideInUp 0.6s ease-out forwards`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="text-center">
                    <Gift size={32} className="text-orange-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                      {winner.name}
                    </div>
                    <div className="text-lg text-orange-600 font-semibold">
                      第 {index + 1} 位得獎者
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Celebration message */}
          <div className="text-2xl text-white font-bold animate-pulse mb-8">
            ✨ 感謝大家的參與！✨
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                console.log('🔄 CelebrationPhase: Back to Overview button clicked');
                onBackToOverview();
              }}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold flex items-center gap-2 shadow-lg transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              回到抽獎總覽
            </button>
            
            <button
              onClick={() => {
                console.log('🔄 CelebrationPhase: Reset button clicked');
                onReset();
              }}
              className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center gap-2 shadow-lg transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Floating particles */}
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
            <div className="w-4 h-4 bg-white rounded-full opacity-60" />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};