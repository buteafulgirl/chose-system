import React from 'react';
import { Settings } from 'lucide-react';
import { LotterySettings as LotterySettingsType } from '../types/lottery';

interface LotterySettingsProps {
  settings: LotterySettingsType;
  onSettingsChange: (settings: LotterySettingsType) => void;
}

export const LotterySettings: React.FC<LotterySettingsProps> = ({ 
  settings, 
  onSettingsChange 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
          <Settings size={16} className="text-white" />
        </div>
        抽獎設定
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            活動標題
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => onSettingsChange({ ...settings, title: e.target.value })}
            placeholder="旭聯科技 ATD25 分享會抽獎"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.allowRepeat}
              onChange={(e) => onSettingsChange({ ...settings, allowRepeat: e.target.checked })}
              className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-gray-700 font-medium">允許重複中獎</span>
          </label>
          <p className="text-sm text-gray-500 ml-8 mt-1">
            勾選後，同一人可以在多次抽獎中重複中獎
          </p>
        </div>
      </div>
    </div>
  );
};