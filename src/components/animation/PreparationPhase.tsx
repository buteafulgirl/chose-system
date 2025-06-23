import React, { useState, useEffect, useRef } from 'react';

interface PreparationPhaseProps {
  onComplete: () => void;
}

export const PreparationPhase: React.FC<PreparationPhaseProps> = ({ onComplete }) => {
  const [countdown, setCountdown] = useState(3);
  const onCompleteRef = useRef(onComplete);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null); // 用於清理 onComplete 的 setTimeout

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 倒數計時的 useEffect，只在組件首次掛載時啟動
  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          return 0; // 倒數結束
        }
        return prev - 1;
      });
    }, 1000);

    // 清理函數：組件卸載時清除 interval
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []); // 空依賴陣列確保只執行一次

  // 處理倒數結束後呼叫 onComplete 的 useEffect
  useEffect(() => {
    if (countdown === 0) {
      // 設置一個 timeout 來呼叫 onComplete
      timeoutIdRef.current = setTimeout(() => {
        console.log('>>> PreparationPhase: ABOUT TO CALL onComplete');
        onCompleteRef.current();
        console.log('<<< PreparationPhase: onComplete CALLED');
      }, 500); // 等待 500ms 顯示 "開始！"
    }

    // 清理函數：組件卸載時，或者當 countdown 不再是 0 時，清除 setTimeout
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [countdown]); // 依賴 countdown，當 countdown 變為 0 時觸發，或當 countdown 改變而不再是 0 時清理

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Countdown display */}
      <div className="relative z-10 text-center">
        {countdown > 0 && (
          <div className="relative">
            <div className="text-9xl font-bold text-white mb-4 animate-bounce">
              {countdown}
            </div>

            {/* Expanding ring effect */}
            <div
              className="absolute inset-0 border-4 border-white rounded-full animate-ping"
              style={{
                width: '200px',
                height: '200px',
                margin: 'auto',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        )}

        {countdown === 0 && (
          <div className="text-6xl font-bold text-yellow-400 animate-pulse">
            開始！
          </div>
        )}
      </div>
    </div>
  );
};