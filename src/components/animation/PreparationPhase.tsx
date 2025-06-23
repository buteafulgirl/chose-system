import React, { useState, useEffect, useRef } from 'react';

interface PreparationPhaseProps {
  onComplete: () => void;
}

export const PreparationPhase: React.FC<PreparationPhaseProps> = ({ onComplete }) => {
  const [countdown, setCountdown] = useState(3);
  const onCompleteRef = useRef(onComplete);
  const intervalIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      timeoutIdRef.current = setTimeout(() => {
        console.log('>>> PreparationPhase: ABOUT TO CALL onComplete');
        onCompleteRef.current();
        console.log('<<< PreparationPhase: onComplete CALLED');
      }, 500);
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [countdown]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
      {/* Animated background waves */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse" />
        <div 
          className="absolute inset-0 bg-gradient-to-l from-pink-500/10 to-blue-500/10"
          style={{
            animation: 'wave 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-pink-400 opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main countdown */}
      <div className="relative z-10 text-center">
        {countdown > 0 && (
          <div className="relative">
            {/* 主要數字與光暈效果 */}
            <div 
              className="text-8xl md:text-9xl font-black text-white select-none"
              style={{
                filter: `drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.6))`,
                animation: 'pulse-scale 1s ease-in-out infinite',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
              }}
            >
              {countdown}
            </div>
            
            {/* 準備文字 */}
            <div className="mt-6 text-xl md:text-2xl font-semibold text-blue-200 animate-bounce">
              準備中...
            </div>
          </div>
        )}

        {countdown === 0 && (
          <div className="relative">
            <div 
              className="text-6xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 193, 7, 0.8))',
                animation: 'celebrate 0.5s ease-out',
              }}
            >
              開始！
            </div>
            
            {/* 慶祝粒子效果 */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                style={{
                  left: '50%',
                  top: '50%',
                  animation: `explode 0.8s ease-out ${i * 0.1}s`,
                  transform: `rotate(${i * 30}deg) translateY(-100px)`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* CSS動畫樣式 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes wave {
            0%, 100% { transform: translateX(-50px) rotate(0deg); }
            50% { transform: translateX(50px) rotate(180deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes celebrate {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          
          @keyframes explode {
            0% { 
              transform: translateY(0); 
              opacity: 1; 
              scale: 0;
            }
            100% { 
              transform: translateY(-150px); 
              opacity: 0; 
              scale: 1;
            }
          }
        `
      }} />
    </div>
  );
};