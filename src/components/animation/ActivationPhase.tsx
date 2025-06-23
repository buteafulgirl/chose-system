import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface ActivationPhaseProps {
  onComplete: () => void;
}

export const ActivationPhase: React.FC<ActivationPhaseProps> = ({ onComplete }) => {
  const [showMagicCircle, setShowMagicCircle] = useState(false);
  const onCompleteRef = useRef(onComplete); 
  const audioRef = useRef<HTMLAudioElement | null>(null); 

  useEffect(() => {
    // 這個 useEffect 確保 onCompleteRef 總是引用最新的 onComplete 函式
    // 它與音樂播放的啟動/停止邏輯是分開的
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // 定時器 ID，用於清理
    let magicCircleTimer: NodeJS.Timeout | undefined;
    let fallbackTimer: NodeJS.Timeout | undefined;
    let audio: HTMLAudioElement | null = null; // 在這個作用域內聲明 audio 變量

    // 步驟 1: 顯示魔法圈
    magicCircleTimer = setTimeout(() => setShowMagicCircle(true), 100);

    // 步驟 2: 初始化並播放音樂
    audio = new Audio('/animation-sound.mp3');
    audio.preload = 'auto'; // 預載入音訊
    audioRef.current = audio; // 將 audio 實例存儲到 ref 中

    const handleAudioEnded = () => {
      console.log('音樂播放結束');
      onCompleteRef.current(); // 音樂播放完畢，觸發完成
      if (audio) {
        audio.removeEventListener('ended', handleAudioEnded);
      }
    };

    const playAudioSequence = async () => {
      if (audio) {
        try {
          await audio.play();
          console.log('音樂開始播放');
          audio.addEventListener('ended', handleAudioEnded);

        } catch (error) {
          // 檢查是否是 AbortError，通常是由於自動播放策略或被另一個 pause() 中斷
          if ((error as DOMException).name === 'AbortError') {
            console.warn('音樂播放被中斷 (可能是 StrictMode 或快速重新渲染導致的 AbortError):', error);
          } else {
            console.error('音樂播放失敗:', error);
          }
          
          console.log('啟動 3 秒強制完成階段 (作為備用機制，以防音樂無法播放或 ended 事件未觸發)');
          fallbackTimer = setTimeout(() => {
            onCompleteRef.current();
          }, 6000); // 3秒後強制完成
        }
      } else {
        console.log('音訊物件不存在，將在 3 秒後強制完成階段 (備用機制)');
        fallbackTimer = setTimeout(() => {
          onCompleteRef.current();
        }, 6000);
      }
    };

    playAudioSequence();

    // 清理函數：組件卸載時執行
    return () => {
      console.log('ActivationPhase 清理中...');
      if (magicCircleTimer) {
        clearTimeout(magicCircleTimer);
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.removeEventListener('ended', handleAudioEnded); // 移除監聽器
        console.log('音樂已停止並清理。');
      }
    };
  }, []); // 關鍵：空依賴陣列確保只在組件首次「有效」掛載時執行一次

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 flex items-center justify-center overflow-hidden">
      {/* Magical particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            <Sparkles 
              size={8 + Math.random() * 16} 
              className="text-yellow-300 opacity-70"
            />
          </div>
        ))}
      </div>

      {/* Magic Circle */}
      {showMagicCircle && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-96 h-96 border-4 border-purple-400 rounded-full animate-spin opacity-80" 
                 style={{ animationDuration: '3s' }} />
            <div className="absolute inset-4 border-2 border-yellow-400 rounded-full animate-spin opacity-60" 
                 style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            <div className="absolute inset-8 border border-white rounded-full animate-pulse opacity-40" />
            
            {/* Magic symbols */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 text-yellow-400 animate-pulse"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-180px)`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                <Zap size={24} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GIF 動畫 */}
      <div className="absolute z-20">
        <img
          src="/mi-animation.gif"
          alt="Magic Animation"
          className="max-w-xs md:max-w-sm lg:max-w-md h-auto"
        />
      </div>

      {/* 標題文字 */}
      <div className="absolute top-1/4 text-center z-30">
        <div className="text-4xl md:text-5xl font-bold text-yellow-300 animate-pulse drop-shadow-lg">
          魔法啟動中...
        </div>
      </div>
    </div>
  );
};