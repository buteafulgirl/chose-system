import React from 'react';
import { Settings, Download, Upload, FileSpreadsheet, FileDown } from 'lucide-react';
import { LotterySettings as LotterySettingsType } from '../types/lottery';
import * as XLSX from 'xlsx';

interface LotterySettingsProps {
  settings: LotterySettingsType;
  onSettingsChange: (settings: LotterySettingsType) => void;
  onExportConfig?: () => void;
  onImportConfig?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExcelImport?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate?: () => void;
}

export const LotterySettings: React.FC<LotterySettingsProps> = ({ 
  settings, 
  onSettingsChange,
  onExportConfig,
  onImportConfig,
  onExcelImport,
  onDownloadTemplate
}) => {
  // 下載Excel模板
  const handleDownloadTemplate = () => {
    if (onDownloadTemplate) {
      onDownloadTemplate();
    } else {
      // 預設模板下載邏輯
      const wb = XLSX.utils.book_new();
      
      // 獎項設定工作表
      const prizeData = [
        { '獎項名稱': '特等獎', '中獎人數': 1 },
        { '獎項名稱': '一等獎', '中獎人數': 2 },
        { '獎項名稱': '二等獎', '中獎人數': 6 }
      ];
      const prizeSheet = XLSX.utils.json_to_sheet(prizeData);
      prizeSheet['!cols'] = [
        { width: 20 }, // 獎項名稱欄位
        { width: 15 }  // 中獎人數欄位
      ];
      XLSX.utils.book_append_sheet(wb, prizeSheet, '獎項設定');
      
      // 參與者名單工作表
      const participantData = [
        { '姓名': '張三' },
        { '姓名': '李四' },
        { '姓名': '王五' }
      ];
      const participantSheet = XLSX.utils.json_to_sheet(participantData);
      participantSheet['!cols'] = [
        { width: 20 } // 姓名欄位
      ];
      XLSX.utils.book_append_sheet(wb, participantSheet, '參與者名單');
      
      XLSX.writeFile(wb, '抽獎系統模板.xlsx');
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
          <Settings size={16} className="text-white" />
        </div>
        抽獎設定s
      </h3>
      
      <div className="space-y-4">
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
      </div>
    </div>
  );
};