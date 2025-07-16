import React from 'react';
import { Play, Settings, Trophy, Users } from 'lucide-react';
import { Prize, Participant, LotterySettings } from '../types/lottery';

interface LotteryOverviewProps {
  settings: LotterySettings;
  prizes: Prize[];
  participants: Participant[];
  onStartPrizeDraw: (prize: Prize) => void;
  onBackToSettings: () => void;
  allResults: { prize: Prize; winners: Participant[] }[];
}

export const LotteryOverview: React.FC<LotteryOverviewProps> = ({
  settings,
  prizes,
  participants,
  onStartPrizeDraw,
  onBackToSettings,
  allResults
}) => {
  const availableParticipants = settings.allowRepeat 
    ? participants 
    : participants.filter(p => !p.isSelected);

  const getPrizeStatus = (prize: Prize) => {
    const result = allResults.find(r => r.prize.id === prize.id);
    return result ? 'completed' : 'pending';
  };

  return (
    <div className="space-y-8">
      {/* Participants count - fixed top left */}
      <div className="fixed top-24 left-4 z-10">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-200 min-w-[200px]">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Users size={16} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800">參與人數</h3>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              可參與抽獎人數：{availableParticipants.length}
            </div>
            {!settings.allowRepeat && participants.some(p => p.isSelected) && (
              <div className="text-sm text-gray-500 mt-1">
                ({participants.filter(p => p.isSelected).length} 人已中獎)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prize cards grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {prizes.map((prize) => {
          const status = getPrizeStatus(prize);
          const result = allResults.find(r => r.prize.id === prize.id);
          const canDraw = availableParticipants.length >= prize.drawCount;
          
          return (
            <div
              key={prize.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                status === 'completed' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-orange-200 hover:border-orange-400'
              }`}
            >
              <div className="text-center space-y-4">
                {/* Prize icon */}
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                }`}>
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
                </div>

                {/* Status or winners */}
                {status === 'completed' && result ? (
                  <div className="bg-green-100 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-800 mb-2">
                      已完成抽獎
                    </div>
                    <div className="text-xs text-green-700">
                      {result.winners.map(w => w.name).join('、')}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onStartPrizeDraw(prize)}
                    disabled={!canDraw}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      canDraw
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={16} />
                    開始抽獎
                  </button>
                )}

                {!canDraw && status !== 'completed' && (
                  <div className="text-xs text-red-500 mt-2">
                    人數不足 (需要 {prize.drawCount} 人)
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