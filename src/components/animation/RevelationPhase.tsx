import React, { useEffect, useState, useRef } from 'react';
import { Participant, Prize } from '../../types/lottery';
import { Trophy, Star } from 'lucide-react';

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
    // Show explosion effect immediately
    setShowExplosion(true);
    
    // Reveal winners one by one
    const revealTimers: NodeJS.Timeout[] = [];
    
    winners.forEach((winner, i) => {
      const delay = i === 0 ? 1000 : 1000 + (i * 500);
      const timer = setTimeout(() => {
        setRevealedWinners(prev => [...prev, winner]);
      }, delay);
      revealTimers.push(timer);
    });
    
    // Complete after all winners are revealed + 2 seconds
    const totalRevealTime = winners.length === 0 ? 1000 : 1000 + (winners.length - 1) * 500;
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, totalRevealTime + 2000);
    
    return () => {
      revealTimers.forEach(timer => clearTimeout(timer));
      clearTimeout(completeTimer);
    };
  }, [winners]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-yellow-600 via-orange-500 to-red-600 flex items-center justify-center overflow-hidden">
      {/* Explosion effect */}
      {showExplosion && (
        <div className="absolute inset-0">
          {/* Golden rays */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-gradient-to-r from-yellow-300 to-transparent opacity-80"
              style={{
                height: '50%',
                left: '50%',
                top: '50%',
                transformOrigin: 'bottom',
                transform: `rotate(${i * 22.5}deg)`,
                animation: `expand 1s ease-out forwards`
              }}
            />
          ))}
          
          {/* Sparkles */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              <Star size={8 + Math.random() * 16} className="text-yellow-200" />
            </div>
          ))}
        </div>
      )}

      {/* Winner cards */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy size={48} className="text-yellow-300 mr-4" />
            <h2 className="text-5xl font-bold text-white">
              {prize.name}
            </h2>
            <Trophy size={48} className="text-yellow-300 ml-4" />
          </div>
          <div className="text-2xl text-yellow-200">
            恭喜以下得獎者！
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {revealedWinners.map((winner, index) => (
            <div
              key={winner.id}
              className="bg-white rounded-xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-105"
              style={{
                animation: `winnerReveal 0.8s ease-out forwards`,
                animationDelay: `${index * 0.2}s`,
                opacity: 0,
                transform: 'scale(0.5) translateY(50px)'
              }}
            >
              <div className="text-2xl font-bold text-gray-800 mb-2">
                🎉 {winner.name} 🎉
              </div>
              <div className="text-lg text-orange-600 font-semibold">
                {prize.name} 得主
              </div>
              
              {/* Confetti effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes expand {
          0% { height: 0; }
          100% { height: 50%; }
        }
        
        @keyframes winnerReveal {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(50px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};