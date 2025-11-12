import React, { useState } from "react";
import { Participant, Prize } from "../types/lottery";
import { RevelationPhase } from "./animation/RevelationPhase";

interface LotteryAnimationProps {
  isVisible: boolean;
  participants: Participant[];
  prize: Prize;
  onComplete: (winners: Participant[]) => void;
  onBackToOverview?: () => void;
  onReset?: () => void;
  onRedraw?: (newWinners: Participant[]) => void;
  availableParticipants?: Participant[];
  logoUrl?: string;
  allParticipants: Participant[]; // 所有參與者（用於排除已中獎者）
  initialWinners?: Participant[]; // 已經抽出的中獎者（重新進入時使用）
}

export const LotteryAnimation: React.FC<LotteryAnimationProps> = ({
  isVisible,
  prize,
  onComplete,
  onBackToOverview,
  onReset,
  onRedraw,
  availableParticipants = [],
  logoUrl = "/sunnetlogo.svg",
  allParticipants,
  initialWinners = [],
}) => {
  const [currentWinners, setCurrentWinners] =
    useState<Participant[]>(initialWinners);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <RevelationPhase
        key={`revelation-${prize.id}-${currentWinners
          .map((w) => w.id)
          .sort()
          .join("-")}`}
        prize={prize}
        onComplete={onComplete}
        onBackToOverview={onBackToOverview}
        onReset={onReset}
        onRedraw={onRedraw}
        availableParticipants={availableParticipants}
        allParticipants={allParticipants}
        logoUrl={logoUrl}
        currentWinners={currentWinners}
        onWinnersChange={setCurrentWinners}
      />
    </div>
  );
};
