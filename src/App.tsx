import React, { useState } from 'react';
import { Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { PrizeManager } from './components/PrizeManager';
import { ParticipantManager } from './components/ParticipantManager';
import { LotterySettings } from './components/LotterySettings';
import { LotteryOverview } from './components/LotteryOverview';
import { LotteryWheel } from './components/LotteryWheel';
import { LotteryResults } from './components/LotteryResults';
import { MagicianAnimation } from './components/MagicianAnimation';
import { Prize, Participant, LotterySettings as LotterySettingsType, LotteryConfig } from './types/lottery';

type AppState = 'setup' | 'overview' | 'drawing' | 'results';

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
  const [winners, setWinners] = useState<Participant[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [allResults, setAllResults] = useState<{ prize: Prize; winners: Participant[] }[]>([]);

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
    const availableParticipants = settings.allowRepeat 
      ? participants 
      : participants.filter(p => !p.isSelected);

    if (availableParticipants.length < prize.drawCount) {
      alert(`可抽獎人數不足！需要 ${prize.drawCount} 人，目前可抽獎人數：${availableParticipants.length}`);
      return;
    }

    setCurrentPrize(prize);
    setState('drawing');
    setIsDrawing(true);
  };

  const handleDrawComplete = (selectedWinners: Participant[]) => {
    setWinners(selectedWinners);
    setIsDrawing(false);
    
    if (!settings.allowRepeat) {
      setParticipants(prev => prev.map(p => ({
        ...p,
        isSelected: selectedWinners.some(w => w.id === p.id) || p.isSelected
      })));
    }

    if (currentPrize) {
      const newResult = { prize: currentPrize, winners: selectedWinners };
      setAllResults(prev => [...prev, newResult]);
    }

    setState('results');
  };

  const resetLottery = () => {
    setState('setup');
    setWinners([]);
    setCurrentPrize(null);
    setIsDrawing(false);
    setAllResults([]);
    setParticipants(prev => prev.map(p => ({ ...p, isSelected: false })));
  };

  const backToOverview = () => {
    setState('overview');
    setCurrentPrize(null);
    setWinners([]);
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

        const confirmMessage = `確定要匯入設定嗎？這將會覆蓋目前的設定。\n\n匯入資料：\n- 獎項：${configData.prizes.length} 個\n- 參與者：${configData.participants.length} 人\n- 匯出時間：${new Date(configData.exportDate).toLocaleString()}`;
        
        if (window.confirm(confirmMessage)) {
          setPrizes(configData.prizes);
          setParticipants(configData.participants.map((p: Participant) => ({ ...p, isSelected: false })));
          setSettings(configData.settings);
          setAllResults([]);
          setState('setup');
          alert('✅ 設定匯入成功！');
        }
      } catch {
        alert('⚠️ 匯入失敗：無法解析檔案內容！');
      }
    };
    
    reader.readAsText(file);
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

        {state === 'drawing' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">正在抽取</h2>
              <div className="text-2xl text-orange-600 font-semibold">
                {currentPrize?.name}（實際抽出 {currentPrize ? Math.min(
                  currentPrize.drawCount,
                  settings.allowRepeat ? participants.length : participants.filter(p => !p.isSelected).length
                ) : 0} 人）
              </div>
            </div>

            <LotteryWheel
              participants={settings.allowRepeat ? participants : participants.filter(p => !p.isSelected)}
              isDrawing={isDrawing}
              onDrawComplete={handleDrawComplete}
              currentPrize={currentPrize}
              allowRepeat={settings.allowRepeat}
            />
          </div>
        )}

        {state === 'results' && (
          <LotteryResults
            winners={winners}
            prize={currentPrize}
            onReset={resetLottery}
            onBackToOverview={backToOverview}
            allResults={allResults}
          />
        )}
      </main>

      <MagicianAnimation isVisible={isDrawing} />
    </div>
  );
}

export default App;
