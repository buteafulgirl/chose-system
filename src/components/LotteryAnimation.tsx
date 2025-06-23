import React, { useState, useEffect, useRef } from 'react';
import { AnimationState, Participant, Prize } from '../types/lottery';
import { PreparationPhase } from './animation/PreparationPhase';
import { ActivationPhase } from './animation/ActivationPhase';
import { RevelationPhase } from './animation/RevelationPhase';
import { CelebrationPhase } from './animation/CelebrationPhase';

interface LotteryAnimationProps {
  isVisible: boolean;
  participants: Participant[];
  prize: Prize;
  onComplete: (winners: Participant[]) => void;
  onPhaseChange?: (phase: AnimationState) => void;
  onBackToOverview?: () => void;
  onReset?: () => void;
}

export const LotteryAnimation: React.FC<LotteryAnimationProps> = ({
  isVisible,
  participants,
  prize,
  onComplete,
  onPhaseChange,
  onBackToOverview,
  onReset
}) => {
  const [currentPhase, setCurrentPhase] = useState<AnimationState>('idle');
  const [winners, setWinners] = useState<Participant[]>([]);
  const onPhaseChangeRef = useRef(onPhaseChange);

  // Update the ref when onPhaseChange changes
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  useEffect(() => {
    if (isVisible && participants.length > 0) {
      // Select winners randomly
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const selectedWinners = shuffled.slice(0, prize.drawCount);
      setWinners(selectedWinners);
      
      // Start with preparation phase
      setCurrentPhase('preparing');
      onPhaseChangeRef.current?.('preparing');
    } else {
      // Reset when not visible
      setCurrentPhase('idle');
      setWinners([]);
    }
  }, [isVisible, participants, prize]);

  if (!isVisible) {
    return null;
  }

const handlePhaseComplete = (nextPhase: AnimationState) => {
  console.log(`--- LotteryAnimation: Transitioning to phase: ${nextPhase}`);
  setCurrentPhase(nextPhase);
  onPhaseChangeRef.current?.(nextPhase);
};

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
          winners={winners}
          prize={prize}
          onComplete={() => {
            console.log('🎯 LotteryAnimation: Revealing phase complete, staying in revealing phase');
            onComplete(winners);
            // 停在RevelationPhase，不跳轉到celebrating
          }} 
        />
      )}
      
      {currentPhase === 'celebrating' && (
        <CelebrationPhase 
          winners={winners}
          prize={prize}
          onBackToOverview={() => {
            console.log('🎯 LotteryAnimation: onBackToOverview called');
            setCurrentPhase('idle');
            onPhaseChangeRef.current?.('idle');
            console.log('🎯 About to call parent onBackToOverview:', onBackToOverview);
            onBackToOverview?.();
          }}
          onReset={() => {
            console.log('🎯 LotteryAnimation: onReset called');
            setCurrentPhase('idle');
            onPhaseChangeRef.current?.('idle');
            console.log('🎯 About to call parent onReset:', onReset);
            onReset?.();
          }}
        />
      )}
    </div>
  );
};