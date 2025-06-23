import React from 'react';
import { Settings, Download, Upload } from 'lucide-react';
import { LotterySettings as LotterySettingsType } from '../types/lottery';

interface LotterySettingsProps {
  settings: LotterySettingsType;
  onSettingsChange: (settings: LotterySettingsType) => void;
  onExportConfig?: () => void;
  onImportConfig?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LotterySettings: React.FC<LotterySettingsProps> = ({ 
  settings, 
  onSettingsChange,
  onExportConfig,
  onImportConfig
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
        
        {/* <div>
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
        </div> */}

        {(onExportConfig || onImportConfig) && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">匯出/匯入設定</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              {onExportConfig && (
                <button
                  onClick={onExportConfig}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  <Download size={16} />
                  匯出設定
                </button>
              )}
              
              {onImportConfig && (
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 cursor-pointer">
                  <Upload size={16} />
                  匯入設定
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportConfig}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              匯出設定可保存當前的獎項、參與者和設定；匯入設定會覆蓋目前所有資料
            </p>
          </div>
        )}
      </div>
    </div>
  );
};