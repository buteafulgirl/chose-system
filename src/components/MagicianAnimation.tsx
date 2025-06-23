import React, { useEffect, useRef, useState } from 'react'; // 引入 useState

interface MagicianAnimationProps {
  isVisible: boolean;
  onMusicComplete?: () => void;
}

export const MagicianAnimation: React.FC<MagicianAnimationProps> = ({ isVisible, onMusicComplete }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 新增狀態來追蹤音樂播放情況，這是你之前代碼中缺少的
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicCompleted, setMusicCompleted] = useState(false);

  useEffect(() => {
    console.log('🎵 MagicianAnimation useEffect triggered:', { isVisible });
    
    // 初始化 audio 元素
    if (!audioRef.current) {
      console.log('🎵 Initializing audio element');
      audioRef.current = new Audio('/animation-sound.mp3');
      audioRef.current.loop = false; // 不循環
      audioRef.current.volume = 0.5; // 音量
    }

    const audio = audioRef.current;

    // 定義音樂結束處理函式，確保它不會重複執行 onMusicComplete
    const handleMusicEnd = () => {
        // 只有當音樂還在播放狀態時才觸發 onMusicComplete
        if (musicPlaying && !musicCompleted) { // 新增檢查確保只執行一次
            console.log('🎵 Music ended / Backup timer triggered - calling onMusicComplete');
            setMusicCompleted(true); // 標記為已完成
            setMusicPlaying(false);  // 標記為停止播放
            if (onMusicComplete) {
                console.log('🎵 Executing onMusicComplete callback');
                onMusicComplete();
            } else {
                console.warn('🎵 onMusicComplete callback is not defined!');
            }
        } else {
            console.log('🎵 handleMusicEnd called but already completed or not playing.');
        }
    };

    if (isVisible) {
      console.log('🎵 Starting music playback');
      // 重置狀態，準備播放
      setMusicCompleted(false);
      setMusicPlaying(true);
      
      // 開始播放音樂
      audio.currentTime = 0; // 從頭開始播放
      audio.play().then(() => {
        console.log('🎵 Audio started playing successfully');
      }).catch((error) => {
        // 處理播放失敗，例如被用戶行為中斷的 AbortError
        console.error('🎵 Audio play failed:', error);
        // 如果播放失敗，可以選擇立即觸發備用機制
        // 確保即使失敗也能繼續流程，但要避免重複觸發
        if (!musicCompleted) { // 避免重複呼叫 handleMusicEnd
             console.log('🎵 Audio play failed, triggering fallback now.');
             handleMusicEnd();
        }
      });

      // 設置音樂結束事件監聽器
      audio.addEventListener('ended', handleMusicEnd);
      
      // 備用定時器：如果音樂在指定時間內未結束，則強制結束
      // **重要：將 8000 毫秒改為你的 animation-sound.mp3 的實際時長（略長一點）**
      const backupTimer = setTimeout(() => {
        console.log('🎵 Backup timer triggered, attempting to call handleMusicEnd.');
        handleMusicEnd(); // 觸發結束處理
      }, 6000); // <-- 請根據你的音訊實際長度調整這個值 (例如：音訊長度 + 0.5 秒)

      // 清理函數：組件卸載或 isVisible 改變為 false 時執行
      return () => {
        console.log('🎵 Cleaning up audio listeners and timers');
        audio.removeEventListener('ended', handleMusicEnd); // 移除監聽器
        clearTimeout(backupTimer); // 清除定時器
        // 停止音樂並重置狀態，防止音樂在後台播放
        audio.pause();
        // audio.currentTime = 0; // 重置時間可選，取決於下次是否需要從頭播放
        setMusicPlaying(false);
        setMusicCompleted(false);
      };
    } else {
      console.log('🎵 Stopping music and resetting state (isVisible is false)');
      // 當 isVisible 為 false 時，停止音樂並重置狀態
      audio.pause();
      setMusicPlaying(false);
      setMusicCompleted(false);
      // 注意：這裡不移除 ended 監聽器和 backupTimer，因為 return 函數已經處理了
      // 如果這個 else 分支是在 return 函數之外執行，你需要手動清理
      // 但在 useEffect 中，它會在 isVisible 從 true 變 false 時執行 return
      // 所以這裡只需要處理停止播放和狀態重置。
    }
  }, [isVisible, onMusicComplete, musicPlaying, musicCompleted]); // 確保依賴完整

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
      isVisible ? 'w-[40vw] h-[40vh] max-w-[400px] max-h-[400px]' : 'w-48 h-56'
    }`}>
      <div className={`w-full h-full ${isVisible ? 'animate-bounce' : ''}`}>
        {isVisible ? (
          // 顯示抽獎動畫 GIF
          <img 
            src="/mi-animation.gif" 
            alt="Magic Animation"
            className="w-full h-full object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback to SVG if GIF is not available
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const nextSibling = target.nextElementSibling as HTMLElement;
              if (nextSibling) {
                nextSibling.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        
        {/* SVG Magician - shown when not drawing or as fallback */}
        <img 
          src="/aMI_magician.svg" 
          alt="Magician"
          className={`w-full h-full object-contain drop-shadow-lg ${isVisible ? 'hidden' : ''}`}
        />
      </div>
    </div>
  );
};