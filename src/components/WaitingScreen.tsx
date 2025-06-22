import React from 'react';
import { Play, Settings, Trophy } from 'lucide-react';
import { Prize, Participant, LotterySettings } from '../types/lottery';

interface WaitingScreenProps {
  settings: LotterySettings;
  prizes: Prize[];
  participants: Participant[];
  onStartLottery: () => void;
  onBackToSettings: () => void;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  settings,
  prizes,
  participants,
  onStartLottery,
  onBackToSettings
}) => {
  const totalDrawCount = prizes.reduce((sum, prize) => sum + prize.drawCount, 0);
  const availableParticipants = settings.allowRepeat 
    ? participants 
    : participants.filter(p => !p.isSelected);

  const canStartLottery = availableParticipants.length >= totalDrawCount && prizes.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Display */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {settings.title || '抽獎活動'}
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prizes Summary */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <Trophy size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">獎項設定</h3>
          </div>
          <div className="space-y-2">
            {prizes.map((prize, index) => (
              <div key={prize.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{prize.name}</span>
                <span className="text-orange-600 font-medium">{prize.drawCount} 人</span>
              </div>
            ))}
            <div className="border-t border-orange-200 pt-2 mt-2">
              <div className="flex justify-between items-center font-bold">
                <span className="text-gray-800">總計</span>
                <span className="text-orange-600">{totalDrawCount} 人</span>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">👥</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800">參與者</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {availableParticipants.length}
            </div>
            <div className="text-sm text-gray-600">
              可參與抽獎人數
            </div>
            {!settings.allowRepeat && participants.some(p => p.isSelected) && (
              <div className="text-xs text-gray-500 mt-1">
                ({participants.filter(p => p.isSelected).length} 人已中獎)
              </div>
            )}
          </div>
        </div>

        {/* Settings Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <Settings size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">抽獎規則</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${settings.allowRepeat ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-700">
                {settings.allowRepeat ? '允許重複中獎' : '不允許重複中獎'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {!canStartLottery && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">!</span>
            </div>
            <div className="text-yellow-800">
              {availableParticipants.length < totalDrawCount 
                ? `參與人數不足！需要 ${totalDrawCount} 人，目前可參與 ${availableParticipants.length} 人`
                : '請先設定獎項和參與者'
              }
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={onStartLottery}
          disabled={!canStartLottery}
          className="px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-bold text-xl shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
        >
          <Play size={24} />
          開始抽獎
        </button>
        
        <button
          onClick={onBackToSettings}
          className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center gap-2 shadow-lg"
        >
          <Settings size={20} />
          修改設定
        </button>
      </div>
    </div>
  );
};