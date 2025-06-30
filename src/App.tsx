import React, { useState, useCallback } from 'react';
import { Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { PrizeManager } from './components/PrizeManager';
import { ParticipantManager } from './components/ParticipantManager';
import { LotterySettings } from './components/LotterySettings';
import { LotteryOverview } from './components/LotteryOverview';
import { LotteryAnimation } from './components/LotteryAnimation';
import { Prize, Participant, LotterySettings as LotterySettingsType, LotteryConfig, AnimationState } from './types/lottery';
import * as XLSX from 'xlsx';

type AppState = 'setup' | 'overview' | 'drawing';

function App() {
  const [state, setState] = useState<AppState>('setup');
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: '特等獎', drawCount: 1 },
    { id: '2', name: '一等獎', drawCount: 2 },
    { id: '3', name: '二等獎', drawCount: 6 }
  ]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [settings, setSettings] = useState<LotterySettingsType>({
    allowRepeat: false,
    title: '旭聯科技 ATD25 分享會'
  });
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [, setWinners] = useState<Participant[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnimationPhase, setCurrentAnimationPhase] = useState<AnimationState>('idle');
  const [allResults, setAllResults] = useState<{ prize: Prize; winners: Participant[] }[]>([]);

  const [effectiveParticipantsForDraw, setEffectiveParticipantsForDraw] = useState<Participant[]>([]);
  const [availableForRedraw, setAvailableForRedraw] = useState<Participant[]>([]);


  const completeSettings = () => {
    if (participants.length === 0) {
      alert('請先新增參與者！');
      return;
    }
    if (prizes.length === 0) {
      alert('請先新增獎項！');
      return;
    }
    setState('overview');
  };

  const startPrizeDraw = (prize: Prize) => {
    console.log('🎯 Starting prize draw for:', prize.name);
    const availableParticipants = settings.allowRepeat
      ? participants
      : participants.filter(p => !p.isSelected);

    if (availableParticipants.length < prize.drawCount) {
      alert(`可抽獎人數不足！需要 ${prize.drawCount} 人，目前可抽獎人數：${availableParticipants.length}`);
      return;
    }

    setCurrentPrize(prize);
    setEffectiveParticipantsForDraw(availableParticipants);
    setAvailableForRedraw(availableParticipants); // 設置可用於重新抽獎的參與者
    setState('drawing');
    setIsDrawing(true);
    setCurrentAnimationPhase('preparing');
  };

  const handleAnimationPhaseChange = useCallback((phase: AnimationState) => {
    setCurrentAnimationPhase(phase);
  }, []);


  // 專門處理按鈕點擊時的數據保存，不影響 isDrawing 狀態
  const handleWinnerDataSave = useCallback((selectedWinners: Participant[]) => {
    setWinners(selectedWinners);

    if (!settings.allowRepeat) {
      // 標記所有中獎者
      setParticipants(prev => prev.map(p => ({
        ...p,
        isSelected: selectedWinners.some(w => w.id === p.id) || p.isSelected
      })));
    }

    if (currentPrize) {
      // 檢查是否已經有這個獎項的結果（重新抽獎情況）
      const existingResultIndex = allResults.findIndex(result => result.prize.id === currentPrize.id);
      if (existingResultIndex >= 0) {
        // 更新現有結果
        setAllResults(prev => prev.map((result, index) => 
          index === existingResultIndex 
            ? { ...result, winners: selectedWinners }
            : result
        ));
      } else {
        // 添加新結果
        const newResult = { prize: currentPrize, winners: selectedWinners };
        setAllResults(prev => [...prev, newResult]);
      }
    }
  }, [settings.allowRepeat, currentPrize, allResults]);

  const handleRedraw = useCallback((newWinners: Participant[]) => {
    console.log('🎯 App: Handling redraw with new winners:', newWinners);
    // 直接更新中獎者狀態，不需要重新開始動畫
    handleWinnerDataSave(newWinners);
  }, [handleWinnerDataSave]);

  const resetLottery = () => {
    console.log('🚀 App: resetLottery called');
    setState('setup');
    setWinners([]);
    setCurrentPrize(null);
    setIsDrawing(false);
    setCurrentAnimationPhase('idle');
    setAllResults([]);
    setParticipants(prev => prev.map(p => ({ ...p, isSelected: false })));
    setEffectiveParticipantsForDraw([]);
    setAvailableForRedraw([]);
  };

  const backToOverview = () => {
    console.log('🚀 App: backToOverview called');
    setState('overview');
    setCurrentPrize(null);
    setWinners([]);
    setIsDrawing(false);
    setCurrentAnimationPhase('idle');
    setEffectiveParticipantsForDraw([]);
    setAvailableForRedraw([]);
  };

  const backToSettings = () => {
    setState('setup');
  };

  const exportConfig = () => {
    const config: LotteryConfig = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      prizes,
      participants,
      settings
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `lottery-config-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const validateConfig = (config: unknown): config is LotteryConfig => {
    if (!config || typeof config !== 'object') return false;

    const obj = config as Record<string, unknown>;

    if (!obj.settings || typeof obj.settings !== 'object' || obj.settings === null) {
      return false;
    }

    const settings = obj.settings as Record<string, unknown>;

    return (
      typeof obj.version === 'string' &&
      typeof obj.exportDate === 'string' &&
      Array.isArray(obj.prizes) &&
      Array.isArray(obj.participants) &&
      typeof settings.allowRepeat === 'boolean' &&
      typeof settings.title === 'string' &&
      obj.prizes.every((prize: unknown) =>
        prize && typeof prize === 'object' && 'id' in prize && 'name' in prize && 'drawCount' in prize &&
        typeof (prize as { drawCount: unknown }).drawCount === 'number'
      ) &&
      obj.participants.every((participant: unknown) =>
        participant && typeof participant === 'object' && 'id' in participant && 'name' in participant
      )
    );
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configData = JSON.parse(e.target?.result as string);

        if (!validateConfig(configData)) {
          alert('⚠️ 匯入失敗：檔案格式不正確！');
          return;
        }

          setPrizes(configData.prizes);
          setParticipants(configData.participants.map((p: Participant) => ({ ...p, isSelected: false })));
          setSettings(configData.settings);
          setAllResults([]);
          setState('setup');
      } catch {
        alert('⚠️ 匯入失敗：無法解析檔案內容！');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  // Excel 完整設定匯入（獎項 + 參與者）
  const importExcelConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        let importedPrizes: Prize[] = [];
        let importedParticipants: Participant[] = [];
        
        // 嘗試讀取獎項設定工作表
        if (workbook.SheetNames.includes('獎項設定')) {
          const prizeSheet = workbook.Sheets['獎項設定'];
          const prizeJsonData = XLSX.utils.sheet_to_json(prizeSheet, { header: 1 }) as (string | number)[][];
          
          for (let i = 1; i < prizeJsonData.length; i++) { // 從第二行開始（跳過標題行）
            const row = prizeJsonData[i];
            if (row && row[0] && row[1] && typeof row[0] === 'string' && typeof row[1] === 'number') {
              const name = row[0].trim();
              const drawCount = Math.max(1, Math.floor(row[1])); // 確保至少為1且為整數
              
              if (name) {
                importedPrizes.push({
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  name: name,
                  drawCount: drawCount
                });
              }
            }
          }
        }
        
        // 嘗試讀取參與者名單工作表
        if (workbook.SheetNames.includes('參與者名單')) {
          const participantSheet = workbook.Sheets['參與者名單'];
          const participantJsonData = XLSX.utils.sheet_to_json(participantSheet, { header: 1 }) as string[][];
          
          for (let i = 1; i < participantJsonData.length; i++) { // 從第二行開始（跳過標題行）
            const row = participantJsonData[i];
            if (row && row[0] && typeof row[0] === 'string' && row[0].trim()) {
              const name = row[0].trim();
              importedParticipants.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: name,
                isSelected: false
              });
            }
          }
        } else {
          // 如果沒有專門的參與者名單工作表，嘗試從第一個工作表讀取
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row[0] && typeof row[0] === 'string' && row[0].trim()) {
              const name = row[0].trim();
              importedParticipants.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: name,
                isSelected: false
              });
            }
          }
        }
        
        // 檢查匯入結果
        if (importedPrizes.length === 0 && importedParticipants.length === 0) {
          alert('⚠️ 匯入失敗：未找到有效的獎項或參與者資料！\n請確保 Excel 檔案包含正確的工作表和資料格式。');
          return;
        }
        
        // 更新應用狀態
        if (importedPrizes.length > 0) {
          setPrizes(importedPrizes);
        }
        if (importedParticipants.length > 0) {
          setParticipants(importedParticipants);
        }
        
        // 重置其他狀態
        setAllResults([]);
        setState('setup');
        
        const successMessage = [];
        if (importedPrizes.length > 0) {
          successMessage.push(`${importedPrizes.length} 個獎項`);
        }
        if (importedParticipants.length > 0) {
          successMessage.push(`${importedParticipants.length} 位參與者`);
        }
        
        alert(`✅ 成功匯入：${successMessage.join('、')}！`);
        
      } catch (error) {
        console.error('Excel import error:', error);
        alert('⚠️ 匯入失敗：無法解析 Excel 檔案！\n請確保檔案格式正確。');
      }
    };

    reader.readAsBinaryString(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center flex items-center justify-center gap-3">
            <Sparkles size={40} />
            {state === 'setup' ? '抽獎系統設定' : settings.title}
            <Sparkles size={40} />
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {state === 'setup' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PrizeManager prizes={prizes} onPrizesChange={setPrizes} />
              <ParticipantManager participants={participants} onParticipantsChange={setParticipants} />
            </div>

            <div className="max-w-md mx-auto">
              <LotterySettings
                settings={settings}
                onSettingsChange={setSettings}
                onExportConfig={exportConfig}
                onImportConfig={importConfig}
                onExcelImport={importExcelConfig}
              />
            </div>

            <div className="text-center">
              <button
                onClick={completeSettings}
                disabled={participants.length === 0 || prizes.length === 0}
                className="px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-bold text-xl shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
              >
                <SettingsIcon size={24} />
                完成設定
              </button>
            </div>
          </div>
        )}

        {state === 'overview' && (
          <LotteryOverview
            settings={settings}
            prizes={prizes}
            participants={participants}
            onStartPrizeDraw={startPrizeDraw}
            onBackToSettings={backToSettings}
            allResults={allResults}
          />
        )}

        {state === 'drawing' && currentPrize && (
          <div className="relative">
            {/* Status indicator (only visible during non-idle animation phases) */}
            {currentAnimationPhase !== 'idle' && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">正在抽取</h2>
                <div className="text-2xl text-orange-600 font-semibold">
                  {currentPrize.name}（抽出 {Math.min(
                    currentPrize.drawCount,
                    effectiveParticipantsForDraw.length
                  )} 人）
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  當前階段: {
                    currentAnimationPhase === 'preparing' ? '準備中' :
                    currentAnimationPhase === 'activating' ? '魔法啟動' :
                    currentAnimationPhase === 'revealing' ? '揭曉結果' :
                    currentAnimationPhase === 'celebrating' ? '慶祝中' :
                    ''
                  }
                </div>
              </div>
            )}

            <LotteryAnimation
              isVisible={isDrawing}
              participants={effectiveParticipantsForDraw}
              prize={currentPrize}
              onComplete={handleWinnerDataSave}
              onPhaseChange={handleAnimationPhaseChange}
              onBackToOverview={backToOverview}
              onReset={resetLottery}
              onRedraw={handleRedraw}
              availableParticipants={availableForRedraw}
            />
          </div>
        )}

      </main>

      {/* 固定在右下角的魔法師圖標 - 佔據螢幕20% */}
      <div className="fixed bottom-4 right-4 z-40">
        <img 
          src="/aMI_magician.svg" 
          alt="Magician"
          className="w-[20vw] h-[20vh] object-contain drop-shadow-lg opacity-80"
        />
      </div>

    </div>
  );
}

export default App;