import React, { useEffect, useState, useRef } from 'react';
import { Participant } from '../../types/lottery';

interface ShufflingPhaseProps {
  participants: Participant[];
  onComplete: () => void;
}

interface FloatingCard {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
  opacity: number;
}

export const ShufflingPhase: React.FC<ShufflingPhaseProps> = ({ participants, onComplete }) => {
  const [cards, setCards] = useState<FloatingCard[]>([]);
  const [showBeam, setShowBeam] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Initialize floating cards
    const initialCards: FloatingCard[] = participants.slice(0, Math.min(30, participants.length)).map((participant) => ({
      id: participant.id,
      name: participant.name,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
      opacity: 0.7 + Math.random() * 0.3
    }));

    setCards(initialCards);

    // Animate cards
    const animationInterval = setInterval(() => {
      setCards(prevCards => 
        prevCards.map(card => ({
          ...card,
          x: (card.x + card.vx + window.innerWidth) % window.innerWidth,
          y: (card.y + card.vy + window.innerHeight) % window.innerHeight,
          rotation: card.rotation + 2,
          opacity: 0.5 + Math.sin(Date.now() * 0.001 + card.x * 0.01) * 0.3
        }))
      );
    }, 50);

    // Show magic beam effect
    setTimeout(() => setShowBeam(true), 1000);

    // Complete phase
    const timer = setTimeout(() => {
      clearInterval(animationInterval);
      onCompleteRef.current();
    }, participants.length > 50 ? 6000 : 4000);

    return () => {
      clearInterval(animationInterval);
      clearTimeout(timer);
    };
  }, [participants]); // Remove onComplete from dependencies

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Magic beam */}
      {showBeam && (
        <div className="absolute inset-0">
          <div 
            className="absolute w-2 bg-gradient-to-b from-yellow-400 to-transparent opacity-80 animate-pulse"
            style={{
              height: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'beam 2s infinite'
            }}
          />
          <style>{`
            @keyframes beam {
              0%, 100% { transform: translateX(-50%) rotate(-10deg); }
              50% { transform: translateX(-50%) rotate(10deg); }
            }
          `}</style>
        </div>
      )}

      {/* Floating name cards */}
      {cards.map(card => (
        <div
          key={card.id}
          className="absolute bg-white rounded-lg shadow-lg p-3 text-center border-2 border-yellow-400 transition-all duration-100"
          style={{
            left: card.x,
            top: card.y,
            transform: `rotate(${card.rotation}deg) scale(${card.scale})`,
            opacity: card.opacity,
            minWidth: '120px'
          }}
        >
          <div className="font-bold text-gray-800 text-sm">
            {card.name}
          </div>
        </div>
      ))}

      {/* Center glow effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-ping" />
        <div className="absolute w-16 h-16 bg-yellow-300 rounded-full opacity-30 animate-pulse" />
      </div>

      {/* Status text */}
      <div className="absolute bottom-20 left-0 right-0 text-center">
        <div className="text-4xl font-bold text-white mb-4 animate-pulse">
          🎲 混合中... 🎲
        </div>
        <div className="text-xl text-yellow-300">
          魔法正在選擇幸運兒
        </div>
      </div>
    </div>
  );
};