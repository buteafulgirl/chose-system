import React, { useState } from "react";
import { UserX, UserCheck } from "lucide-react";
import { Participant, Prize } from "../../types/lottery";

interface RevelationPhaseProps {
  prize: Prize;
  onComplete: (winners: Participant[]) => void;
  onBackToOverview?: () => void;
  onReset?: () => void;
  onRedraw?: (newWinners: Participant[]) => void;
  availableParticipants?: Participant[];
  allParticipants: Participant[]; // 所有參與者（包含其他獎項已中獎者）
  logoUrl?: string;
  currentWinners: Participant[];
  onWinnersChange: (winners: Participant[]) => void;
}

export const RevelationPhase: React.FC<RevelationPhaseProps> = ({
  prize,
  onComplete,
  onBackToOverview,
  onRedraw,
  availableParticipants = [],
  allParticipants,
  logoUrl = "/sunnetlogo.svg",
  currentWinners,
  onWinnersChange,
}) => {
  const [absentWinners, setAbsentWinners] = useState<Set<string>>(new Set());
  const [permanentlyAbsentWinners, setPermanentlyAbsentWinners] = useState<
    Set<string>
  >(new Set());

  // 計算還需要抽取的人數
  const remainingDrawCount = prize.drawCount - currentWinners.length;

  // 判斷是否已達到應抽取的人數
  const hasReachedDrawCount = currentWinners.length >= prize.drawCount;

  // 抽下一位
  const drawNextWinner = () => {
    if (remainingDrawCount <= 0) {
      alert("已經抽完所有名額！");
      return;
    }

    // 獲取所有已中獎的參與者ID（包括其他獎項）
    const alreadyWonIds = new Set(
      allParticipants.filter((p) => p.isSelected).map((p) => p.id)
    );

    // 加入當前獎項已抽出的中獎者
    currentWinners.forEach((w) => alreadyWonIds.add(w.id));

    // 過濾出可抽取的參與者
    const eligibleParticipants = availableParticipants.filter(
      (p) => !alreadyWonIds.has(p.id) && !permanentlyAbsentWinners.has(p.id)
    );

    console.log("🎯 Draw Next Winner Debug:", {
      totalAvailable: availableParticipants.length,
      alreadyWonCount: alreadyWonIds.size,
      permanentlyAbsentCount: permanentlyAbsentWinners.size,
      eligibleCount: eligibleParticipants.length,
      currentWinnersCount: currentWinners.length,
      remaining: remainingDrawCount,
    });

    if (eligibleParticipants.length === 0) {
      alert("沒有可抽取的參與者！");
      return;
    }

    // 隨機選一位
    const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const newWinner = eligibleParticipants[randomIndex];

    // 更新中獎者列表
    const updatedWinners = [...currentWinners, newWinner];
    onWinnersChange(updatedWinners);

    // 每次抽獎都保存結果
    onComplete(updatedWinners);
    onRedraw?.(updatedWinners);
  };

  // 一次抽完
  const drawAllAtOnce = () => {
    if (remainingDrawCount <= 0) {
      alert("已經抽完所有名額！");
      return;
    }

    // 獲取所有已中獎的參與者ID（包括其他獎項）
    const alreadyWonIds = new Set(
      allParticipants.filter((p) => p.isSelected).map((p) => p.id)
    );

    // 加入當前獎項已抽出的中獎者
    currentWinners.forEach((w) => alreadyWonIds.add(w.id));

    // 過濾出可抽取的參與者
    const eligibleParticipants = availableParticipants.filter(
      (p) => !alreadyWonIds.has(p.id) && !permanentlyAbsentWinners.has(p.id)
    );

    console.log("🎯 Draw All At Once Debug:", {
      totalAvailable: availableParticipants.length,
      alreadyWonCount: alreadyWonIds.size,
      permanentlyAbsentCount: permanentlyAbsentWinners.size,
      eligibleCount: eligibleParticipants.length,
      needToDraw: remainingDrawCount,
    });

    if (eligibleParticipants.length < remainingDrawCount) {
      alert(
        `可抽獎人數不足！需要 ${remainingDrawCount} 人，目前可抽獎人數：${eligibleParticipants.length}`
      );
      return;
    }

    // 隨機抽取所有剩餘名額
    const shuffled = [...eligibleParticipants].sort(() => Math.random() - 0.5);
    const newWinners = shuffled.slice(0, remainingDrawCount);

    // 更新中獎者列表
    const updatedWinners = [...currentWinners, ...newWinners];
    onWinnersChange(updatedWinners);

    // 保存結果
    onComplete(updatedWinners);
    onRedraw?.(updatedWinners);
  };

  const toggleAbsentStatus = (participantId: string) => {
    const isCurrentlyAbsent = absentWinners.has(participantId);

    if (isCurrentlyAbsent) {
      // 取消不在場標記 - 恢復到中獎名單
      setAbsentWinners((prev) => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
      // 從永久排除名單中移除
      setPermanentlyAbsentWinners((prev) => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
    } else {
      // 標記為不在場 - 從中獎名單中移除並永久排除
      setAbsentWinners((prev) => {
        const newSet = new Set(prev);
        newSet.add(participantId);
        return newSet;
      });

      // 立即從中獎者名單中移除
      const updatedWinners = currentWinners.filter(
        (w) => w.id !== participantId
      );
      onWinnersChange(updatedWinners);

      // 加入永久排除名單
      setPermanentlyAbsentWinners((prev) => {
        const newSet = new Set(prev);
        newSet.add(participantId);
        return newSet;
      });

      // 通知父組件更新
      onComplete(updatedWinners);
      onRedraw?.(updatedWinners);

      console.log("🚫 Marked as absent and removed:", {
        participantId,
        remainingWinners: updatedWinners.length,
        newRemainingDrawCount: prize.drawCount - updatedWinners.length,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#f5f3e8] via-[#faf5f0] to-[#ffe5e5] flex items-center justify-center overflow-hidden">
      {/* 背景圖片裝飾 */}
      <img
        src="/image copy.png"
        alt=""
        className="absolute top-0 right-0 w-64 h-64 object-contain opacity-60"
      />
      <img
        src="/image copy.png"
        alt=""
        className="absolute bottom-0 left-0 w-48 h-48 object-contain opacity-70 transform scale-x-[-1]"
      />
      <img
        src="/image copy.png"
        alt=""
        className="absolute top-20 left-10 w-56 h-56 object-contain opacity-50 transform scale-x-[-1] rotate-90"
      />
      <img
        src="/image copy.png"
        alt=""
        className="absolute bottom-10 right-10 w-40 h-40 object-contain opacity-60 transform rotate-[-30deg]"
      />

      {/* 主要內容 */}
      <div className="relative z-10 h-full flex flex-col">
        {/* 獎項標題 */}
        <div className="flex-shrink-0 w-screen bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg py-3 -mx-4">
          <div className="px-4 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-10 md:h-12 object-contain flex-shrink-0"
              />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-lg flex-1 text-center truncate">
                {prize.name}
              </h2>
              <div className="w-10 md:w-12 flex-shrink-0"></div>
            </div>
          </div>
        </div>

        {/* 狀態顯示區域 */}
        <div className="flex-shrink-0 px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-xl text-gray-600">
                需抽取 {prize.drawCount} 人，已抽出 {currentWinners.length} 人
                {!hasReachedDrawCount && `，剩餘 ${remainingDrawCount} 人`}
              </div>
            </div>
          </div>
        </div>

        {/* 得獎者卡片區域（佔據剩餘空間） */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {currentWinners.length > 0 && (
            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto p-4">
              {currentWinners.map((winner, index) => {
                const isAbsent = absentWinners.has(winner.id);
                return (
                  <div
                    key={winner.id}
                    className={`bg-white rounded-2xl p-4 shadow-2xl transform transition-all duration-300 hover:scale-105 relative ${
                      isAbsent ? "opacity-60 bg-gray-100" : ""
                    }`}
                  >
                    {/* 不在場狀態切換按鈕（始終顯示） */}
                    <button
                      onClick={() => toggleAbsentStatus(winner.id)}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
                        isAbsent
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      title={isAbsent ? "標記為在場" : "標記為不在場"}
                    >
                      {isAbsent ? <UserX size={20} /> : <UserCheck size={20} />}
                    </button>

                    {/* 得獎者名字 */}
                    <div
                      className={`text-2xl sm:text-3xl font-black ${
                        isAbsent ? "text-gray-500" : "text-gray-800"
                      } break-words overflow-wrap-anywhere text-center leading-tight px-2`}
                    >
                      {winner.name}
                    </div>

                    {/* 不在場標記 */}
                    {isAbsent && (
                      <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        不在場
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部按鈕區（始終顯示） */}
        <div className="flex-shrink-0 px-6 pb-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* 抽獎按鈕 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={drawNextWinner}
                disabled={hasReachedDrawCount}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold text-xl shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8" />
                  <path d="m8 12 4 4 4-4" />
                </svg>
                抽下一位
              </button>

              <button
                onClick={drawAllAtOnce}
                disabled={hasReachedDrawCount}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-bold text-xl shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                一次抽完
              </button>
            </div>

            {/* 導航按鈕 */}
            <div className="flex justify-center items-center">
              {onBackToOverview && (
                <button
                  onClick={() => {
                    console.log(
                      "🔄 RevelationPhase: Back to Overview button clicked"
                    );
                    onBackToOverview();
                  }}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-bold text-lg flex items-center gap-2 shadow-lg transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                  回到抽獎總覽
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 固定在右下角的魔法師圖標 */}
      <div className="fixed bottom-4 right-4 z-60">
        <img
          src="/aMI_magician.svg"
          alt="Magician"
          className="w-[20vw] h-[20vh] object-contain drop-shadow-lg opacity-80"
        />
      </div>
    </div>
  );
};
