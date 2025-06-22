import React, { useEffect, useRef, useState } from 'react';

interface MagicianAnimationProps {
  isVisible: boolean;
  onMusicComplete?: () => void;
}

export const MagicianAnimation: React.FC<MagicianAnimationProps> = ({ isVisible, onMusicComplete }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicCompleted, setMusicCompleted] = useState(false);

  useEffect(() => {
    console.log('🎵 MagicianAnimation useEffect triggered:', { isVisible });
    
    // Initialize audio on first render
    if (!audioRef.current) {
      console.log('🎵 Initializing audio element');
      audioRef.current = new Audio('/animation-sound.mp3');
      audioRef.current.loop = false; // 改為不循環，播放一次後開始抽獎
      audioRef.current.volume = 0.5;
    }

    const audio = audioRef.current;

    if (isVisible) {
      console.log('🎵 Starting music playback');
      // 重置狀態
      setMusicCompleted(false);
      setMusicPlaying(true);
      
      // 開始播放音樂
      audio.currentTime = 0;
      audio.play().then(() => {
        console.log('🎵 Audio started playing successfully');
      }).catch((error) => {
        console.error('🎵 Audio play failed:', error);
      });

      // 設置音樂結束事件監聽器和固定時間備用
      const handleMusicEnd = () => {
        console.log('🎵 Music ended - calling onMusicComplete');
        setMusicCompleted(true);
        setMusicPlaying(false);
        if (onMusicComplete) {
          console.log('🎵 Executing onMusicComplete callback');
          onMusicComplete();
        } else {
          console.warn('🎵 onMusicComplete callback is not defined!');
        }
      };

      audio.addEventListener('ended', handleMusicEnd);
      
      // 備用定時器：3秒後如果音樂還沒結束就強制開始抽獎
      console.log('🎵 Setting backup timer for 3 seconds');
      const backupTimer = setTimeout(() => {
        console.log('🎵 Backup timer triggered - forcing music end');
        handleMusicEnd();
      }, 6000);

      // 清理事件監聽器和定時器
      return () => {
        console.log('🎵 Cleaning up audio listeners and timers');
        audio.removeEventListener('ended', handleMusicEnd);
        clearTimeout(backupTimer);
      };
    } else {
      console.log('🎵 Stopping music and resetting state');
      // 停止音樂並重置狀態
      audio.pause();
      setMusicPlaying(false);
      setMusicCompleted(false);
    }
  }, [isVisible, onMusicComplete]);
  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
      isVisible ? 'w-[40vw] h-[40vh] max-w-[400px] max-h-[400px]' : 'w-48 h-56'
    }`}>
      <div className={`w-full h-full ${isVisible ? 'animate-bounce' : ''}`}>
        {isVisible ? (
          // 顯示抽獎動畫
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