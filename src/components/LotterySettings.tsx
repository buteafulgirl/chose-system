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
    </div>
  );
};