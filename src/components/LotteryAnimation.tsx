import React, { useState, useEffect, useRef } from 'react';
import { AnimationState, Participant, Prize } from '../types/lottery';
import { PreparationPhase } from './animation/PreparationPhase';
import { ActivationPhase } from './animation/ActivationPhase';
import { RevelationPhase } from './animation/RevelationPhase';

interface LotteryAnimationProps {
  isVisible: boolean;
  participants: Participant[];
  prize: Prize;
  onComplete: (winners: Participant[]) => void;
  onPhaseChange?: (phase: AnimationState) => void;
  onBackToOverview?: () => void;
  onReset?: () => void;
  onRedraw?: (newWinners: Participant[]) => void;
  availableParticipants?: Participant[];
}

export const LotteryAnimation: React.FC<LotteryAnimationProps> = ({
  isVisible,
  participants,
  prize,
  onComplete,
  onPhaseChange,
  onBackToOverview,
  onReset,
  onRedraw,
  availableParticipants = []
}) => {
  const [currentPhase, setCurrentPhase] = useState<AnimationState>('idle');
  const [winners, setWinners] = useState<Participant[]>([]);
  const onPhaseChangeRef = useRef(onPhaseChange);

  // Update the ref when onPhaseChange changes
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  useEffect(() => {
    if (isVisible && participants.length > 0 && currentPhase === 'idle') {
      // 正常抽獎模式 - 只在初始狀態下進行
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const finalWinners = shuffled.slice(0, prize.drawCount);
      
      setWinners(finalWinners);
      
      // Start with preparation phase
      setCurrentPhase('preparing');
      onPhaseChangeRef.current?.('preparing');
    } else if (!isVisible) {
      // Reset when not visible
      setCurrentPhase('idle');
      setWinners([]);
    }
  }, [isVisible, participants, prize, currentPhase]);

  const handlePhaseComplete = (nextPhase: AnimationState) => {
    console.log(`--- LotteryAnimation: Transitioning to phase: ${nextPhase}`);
    setCurrentPhase(nextPhase);
    onPhaseChangeRef.current?.(nextPhase);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {currentPhase === 'preparing' && (
        <PreparationPhase onComplete={() => handlePhaseComplete('activating')} />
      )}
      
      {currentPhase === 'activating' && (
        // 直接從激活階段跳轉到揭曉階段
        <ActivationPhase onComplete={() => handlePhaseComplete('revealing')} />
      )}
      
      {currentPhase === 'revealing' && (
        <RevelationPhase 
          key={`revelation-${prize.id}-${winners.map(w => w.id).sort().join('-')}`}
          winners={winners}
          prize={prize}
          onComplete={() => {
            console.log('🎯 LotteryAnimation: Revealing phase complete, staying in revealing phase');
            // 不調用 onComplete(winners)，避免觸發 App 的 handleAnimationComplete
            // 停在RevelationPhase，不跳轉到celebrating
          }}
          onBackToOverview={() => {
            console.log('🎯 LotteryAnimation: onBackToOverview called from RevelationPhase');
            // 先處理中獎者數據，再切換狀態
            onComplete(winners);
            setCurrentPhase('idle');
            onPhaseChangeRef.current?.('idle');
            console.log('🎯 About to call parent onBackToOverview:', onBackToOverview);
            onBackToOverview?.();
          }}
          onReset={() => {
            console.log('🎯 LotteryAnimation: onReset called from RevelationPhase');
            // 先處理中獎者數據，再切換狀態
            onComplete(winners);
            setCurrentPhase('idle');
            onPhaseChangeRef.current?.('idle');
            console.log('🎯 About to call parent onReset:', onReset);
            onReset?.();
          }}
          onRedraw={(newWinners) => {
            // 更新當前的中獎者
            setWinners(newWinners);
            // 通知父組件
            onRedraw?.(newWinners);
          }}
          availableParticipants={availableParticipants}
        />
      )}
    </div>
  );
};