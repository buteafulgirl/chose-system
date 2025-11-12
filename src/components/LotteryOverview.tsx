import React from "react";
import { Play, Settings, Trophy } from "lucide-react";
import {
  Prize,
  Participant,
  LotterySettings,
  ParticipantListData,
} from "../types/lottery";

interface LotteryOverviewProps {
  settings: LotterySettings;
  prizes: Prize[];
  participantLists: ParticipantListData[];
  onStartPrizeDraw: (prize: Prize) => void;
  onBackToSettings: () => void;
  allResults: { prize: Prize; winners: Participant[] }[];
}

export const LotteryOverview: React.FC<LotteryOverviewProps> = ({
  settings,
  prizes,
  participantLists,
  onStartPrizeDraw,
  onBackToSettings,
  allResults,
}) => {
  // 計算所有參與者
  const allParticipants = participantLists.flatMap((l) => l.participants);

  const availableParticipants = settings.allowRepeat
    ? allParticipants
    : allParticipants.filter((p) => !p.isSelected);

  const getPrizeStatus = (prize: Prize) => {
    const result = allResults.find((r) => r.prize.id === prize.id);
    if (!result) return "pending";
    // 檢查是否真正完成（中獎人數達到應抽取人數）
    if (result.winners.length >= prize.drawCount) return "completed";

    // 檢查該獎項是否還有可抽取的參與者
    const eligibleCount = getEligibleParticipantsCount(prize);
    if (eligibleCount === 0) {
      // 如果沒有可抽取的參與者了，視為完成狀態
      return "completed";
    }

    return "partial";
  };

  // 計算該獎項還有多少可抽取的參與者
  const getEligibleParticipantsCount = (prize: Prize) => {
    // 獲取該獎項可用的參與者
    const prizeParticipants = prize.participantListId
      ? participantLists.find((l) => l.list.id === prize.participantListId)
          ?.participants || []
      : allParticipants;

    // 如果允許重複中獎，所有參與者都可抽
    if (settings.allowRepeat) {
      return prizeParticipants.length;
    }

    // 不允許重複中獎，排除已中獎者
    return prizeParticipants.filter((p) => !p.isSelected).length;
  };

  return (
    <div className="space-y-8">
      {/* Participants count - fixed top left */}

      {/* Prize cards grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {prizes.map((prize) => {
          const status = getPrizeStatus(prize);
          const result = allResults.find((r) => r.prize.id === prize.id);
          const canDraw = availableParticipants.length >= prize.drawCount;
          const remainingDrawCount = result
            ? prize.drawCount - result.winners.length
            : prize.drawCount;

          return (
            <div
              key={prize.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                status === "completed"
                  ? "border-green-500 bg-green-50"
                  : status === "partial"
                  ? "border-blue-500 bg-blue-50"
                  : "border-orange-200 hover:border-orange-400"
              }`}
            >
              <div className="text-center space-y-4">
                {/* Prize icon */}
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    status === "completed"
                      ? "bg-green-500"
                      : status === "partial"
                      ? "bg-blue-500"
                      : "bg-orange-500"
                  }`}
                >
                  <Trophy size={32} className="text-white" />
                </div>

                {/* Prize name and count */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {prize.name}
                  </h3>
                  <p className="text-orange-600 font-medium">
                    {prize.drawCount} 人
                  </p>
                  {status === "partial" && result && (
                    <p className="text-blue-600 text-sm mt-1">
                      已抽出 {result.winners.length} 人，剩餘{" "}
                      {remainingDrawCount} 人
                    </p>
                  )}
                </div>

                {/* Status or winners */}
                {status === "completed" && result ? (
                  <div className="bg-green-100 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-800 mb-2">
                      {result.winners.length >= prize.drawCount
                        ? "已完成抽獎"
                        : "最終抽獎結果"}
                    </div>

                    <div className="text-xs text-green-700">
                      {result.winners.map((w) => w.name).join("、")}
                    </div>
                    {result.winners.length < prize.drawCount && (
                      <div className="text-xs text-orange-600 mb-1">
                        (名單已抽完)
                      </div>
                    )}
                  </div>
                ) : status === "partial" ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => onStartPrizeDraw(prize)}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Play size={16} />
                      繼續抽獎
                    </button>
                    <div className="text-xs text-gray-600 text-center">
                      待抽人數：{getEligibleParticipantsCount(prize)} 人
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => onStartPrizeDraw(prize)}
                      disabled={!canDraw}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        canDraw
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Play size={16} />
                      開始抽獎
                    </button>
                    <div className="text-xs text-gray-600 text-center">
                      待抽人數：{getEligibleParticipantsCount(prize)} 人
                    </div>
                    {!canDraw && (
                      <div className="text-xs text-red-500 text-center">
                        人數不足 (需要 {prize.drawCount} 人)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings button */}
      <div className="text-center mt-12">
        <button
          onClick={onBackToSettings}
          className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center gap-2 shadow-lg mx-auto"
        >
          <Settings size={20} />
          修改設定
        </button>
      </div>
    </div>
  );
};
