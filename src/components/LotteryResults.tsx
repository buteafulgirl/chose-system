import React from 'react';
import { Trophy, Settings, ArrowLeft } from 'lucide-react';
import { Participant, Prize } from '../types/lottery';

interface LotteryResultsProps {
  winners: Participant[];
  prize: Prize | null;
  onReset: () => void;
  onBackToOverview: () => void;
  allResults?: { prize: Prize; winners: Participant[] }[];
}

export const LotteryResults: React.FC<LotteryResultsProps> = ({
  winners,
  prize,
  onReset,
  onBackToOverview
}) => {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-500" size={48} />
          恭喜中獎！
        </h2>
        
        {prize && (
          <div className="text-orange-600 font-semibold" style={{ fontSize: '3rem' }}>
            獎項：{prize.name}
          </div>
        )}
      </div>

      {/* Winners display - centered with max 80% width */}
      <div className="max-w-[80%] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          {winners.map((winner, index) => (
            <div
              key={winner.id}
              className="bg-gradient-to-br from-yellow-100 to-orange-100 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 w-full max-w-[200px]"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="text-2xl font-bold text-gray-800 mb-2 text-center">
                {winner.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={onBackToOverview}
          className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft size={20} />
          回到抽獎總覽
        </button>
        
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center gap-2 shadow-lg"
        >
          <Settings size={20} />
          重新設定
        </button>
      </div>
    </div>
  );
};