import React, { useState, useCallback } from 'react';
import { Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { PrizeManager } from './components/PrizeManager';
import { ParticipantManager } from './components/ParticipantManager';
import { LotterySettings } from './components/LotterySettings';
import { LotteryOverview } from './components/LotteryOverview';
import { LotteryAnimation } from './components/LotteryAnimation';
import { Prize, Participant, LotterySettings as LotterySettingsType, LotteryConfig, ParticipantList, ParticipantListData } from './types/lottery';
import * as XLSX from 'xlsx';

type AppState = 'setup' | 'overview' | 'drawing';

function App() {
  const [state, setState] = useState<AppState>('setup');
  const [participantLists, setParticipantLists] = useState<ParticipantListData[]>([
    { list: { id: '1', name: '通用參與者' }, participants: [] }  // 默認名單
  ]);
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', number: 1, name: '金獎-Dyson吹風機', drawCount: 2 },
    { id: '2', number: 2, name: '銀獎-Apple Watch SE3', drawCount: 2},
    { id: '3', number: 3, name: '銅獎-日本千石瞬熱石墨烤箱', drawCount: 3 },
    { id: '4', number: 4, name: '加碼獎- 產品體驗券', drawCount: 10 }
  ]);
  const [settings, setSettings] = useState<LotterySettingsType>({
    allowRepeat: false,
    title: '2025 AI數位學習平台 新品展銷會'
  });
  const [logoUrl, setLogoUrl] = useState<string>('/sunnetlogo.svg');
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [allResults, setAllResults] = useState<{ prize: Prize; winners: Participant[] }[]>([]);

  const [effectiveParticipantsForDraw, setEffectiveParticipantsForDraw] = useState<Participant[]>([]);
  const [availableForRedraw, setAvailableForRedraw] = useState<Participant[]>([]);


  const completeSettings = () => {
    const totalParticipants = participantLists.reduce((sum, list) => sum + list.participants.length, 0);
    if (totalParticipants === 0) {
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

    // 檢查是否已經有該獎項的中獎者（重新進入情況）
    const existingResult = allResults.find(r => r.prize.id === prize.id);
    const existingWinners = existingResult?.winners || [];

    // 第一層過濾：根據名單篩選
    let listFiltered: Participant[] = [];
    if (prize.participantListId) {
      // 綁定到特定名單
      const targetList = participantLists.find(l => l.list.id === prize.participantListId);
      listFiltered = targetList?.participants || [];
    } else {
      // 沒有綁定名單 = 所有名單的參與者都可以
      listFiltered = participantLists.flatMap(l => l.participants);
    }

    // 第二層過濾：根據重複抽獎設置
    const availableParticipants = settings.allowRepeat
      ? listFiltered
      : listFiltered.filter(p => !p.isSelected);

    // 計算還需要抽取的人數
    const remainingDrawCount = prize.drawCount - existingWinners.length;

    if (remainingDrawCount > 0 && availableParticipants.length < remainingDrawCount) {
      alert(`可抽獎人數不足！需要 ${remainingDrawCount} 人，目前可抽獎人數：${availableParticipants.length}`);
      return;
    }

    setCurrentPrize(prize);
    setWinners(existingWinners); // 設置已有的中獎者
    setEffectiveParticipantsForDraw(availableParticipants);
    setAvailableForRedraw(availableParticipants); // 設置可用於重新抽獎的參與者
    setState('drawing');
    setIsDrawing(true);
  };

  // 專門處理按鈕點擊時的數據保存，不影響 isDrawing 狀態
  const handleWinnerDataSave = useCallback((selectedWinners: Participant[]) => {
    setWinners(selectedWinners);

    if (!settings.allowRepeat) {
      // 標記所有中獎者
      setParticipantLists(prev => prev.map(list => ({
        ...list,
        participants: list.participants.map(p => ({
          ...p,
          isSelected: selectedWinners.some(w => w.id === p.id) || p.isSelected
        }))
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
    setAllResults([]);
    setParticipantLists(prev => prev.map(list => ({
      ...list,
      participants: list.participants.map(p => ({ ...p, isSelected: false }))
    })));
    setEffectiveParticipantsForDraw([]);
    setAvailableForRedraw([]);
  };

  const backToOverview = () => {
    console.log('🚀 App: backToOverview called');
    setState('overview');
    setCurrentPrize(null);
    setWinners([]);
    setIsDrawing(false);
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
      participantLists,
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
      Array.isArray(obj.participantLists) &&
      typeof settings.allowRepeat === 'boolean' &&
      typeof settings.title === 'string' &&
      obj.prizes.every((prize: unknown) =>
        prize && typeof prize === 'object' && 'id' in prize && 'number' in prize && 'name' in prize && 'drawCount' in prize &&
        typeof (prize as { drawCount: unknown }).drawCount === 'number' &&
        typeof (prize as { number: unknown }).number === 'number'
      ) &&
      (obj.participantLists as unknown[]).every((listData: unknown) =>
        listData && typeof listData === 'object' &&
        'list' in listData && 'participants' in listData &&
        (listData as any).list && typeof (listData as any).list === 'object' &&
        'id' in (listData as any).list && 'name' in (listData as any).list &&
        Array.isArray((listData as any).participants) &&
        ((listData as any).participants as unknown[]).every((p: unknown) =>
          p && typeof p === 'object' && 'id' in p && 'name' in p
        )
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

        // 為參與者添加 isSelected: false
        const importedLists = configData.participantLists.map((listData: ParticipantListData) => ({
          list: listData.list,
          participants: listData.participants.map(p => ({ ...p, isSelected: false }))
        }));

        setParticipantLists(importedLists);
        setPrizes(configData.prizes);
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

  // 下載Excel模板
  const downloadExcelTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. 參與名單工作表
    const listData = [
      { '名單ID': 'list1', '名單名稱': '通用參與者' },
      { '名單ID': 'list2', '名單名稱': 'VIP客戶' }
    ];
    const listSheet = XLSX.utils.json_to_sheet(listData);
    listSheet['!cols'] = [
      { width: 15 },
      { width: 20 }
    ];
    XLSX.utils.book_append_sheet(wb, listSheet, '參與名單');

    // 2. 獎項設定工作表（增加綁定名單ID列）
    const prizeData = [
      { '獎項名稱': '特等獎', '中獎人數': 1, '綁定名單ID': '' },
      { '獎項名稱': '一等獎', '中獎人數': 2, '綁定名單ID': 'list2' },
      { '獎項名稱': '二等獎', '中獎人數': 6, '綁定名單ID': '' }
    ];
    const prizeSheet = XLSX.utils.json_to_sheet(prizeData);
    prizeSheet['!cols'] = [
      { width: 20 },
      { width: 15 },
      { width: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, prizeSheet, '獎項設定');

    // 3. 參與者清單工作表（增加名單ID列）
    const participantData = [
      { '名單ID': 'list1', '姓名': '張三' },
      { '名單ID': 'list2', '姓名': '李四' },
      { '名單ID': 'list1', '姓名': '王五' }
    ];
    const participantSheet = XLSX.utils.json_to_sheet(participantData);
    participantSheet['!cols'] = [
      { width: 15 },
      { width: 20 }
    ];
    XLSX.utils.book_append_sheet(wb, participantSheet, '參與者清單');

    XLSX.writeFile(wb, '抽獎系統模板.xlsx');
  };

  // Excel 完整設定匯入（參與名單 + 參與者 + 獎項）
  const importExcelConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        let importedLists: ParticipantList[] = [];
        let importedPrizes: Prize[] = [];
        const participantsByListId: Map<string, Participant[]> = new Map();

        // 1. 讀取參與名單工作表
        if (workbook.SheetNames.includes('參與名單')) {
          const listSheet = workbook.Sheets['參與名單'];
          const listJsonData = XLSX.utils.sheet_to_json(listSheet, { header: 1 }) as (string | number)[][];

          for (let i = 1; i < listJsonData.length; i++) {
            const row = listJsonData[i];
            if (row && row[0] && row[1]) {
              const listId = String(row[0]).trim();
              const listName = String(row[1]).trim();
              if (listId && listName) {
                importedLists.push({ id: listId, name: listName });
                participantsByListId.set(listId, []);
              }
            }
          }
        }

        // 確保至少有一個默認名單
        if (importedLists.length === 0) {
          const defaultListId = '1';
          importedLists = [{ id: defaultListId, name: '通用參與者' }];
          participantsByListId.set(defaultListId, []);
        }

        // 2. 讀取獎項設定工作表
        if (workbook.SheetNames.includes('獎項設定')) {
          const prizeSheet = workbook.Sheets['獎項設定'];
          const prizeJsonData = XLSX.utils.sheet_to_json(prizeSheet, { header: 1 }) as (string | number)[][];

          let prizeNumber = 1;
          for (let i = 1; i < prizeJsonData.length; i++) {
            const row = prizeJsonData[i];
            if (row && row[0] && row[1] && typeof row[0] === 'string' && typeof row[1] === 'number') {
              const name = row[0].trim();
              const drawCount = Math.max(1, Math.floor(row[1]));
              const participantListId = row[2] ? String(row[2]).trim() : undefined;

              if (name) {
                importedPrizes.push({
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  number: prizeNumber++,
                  name: name,
                  drawCount: drawCount,
                  participantListId: participantListId || undefined
                });
              }
            }
          }
        }

        // 3. 讀取參與者清單工作表
        if (workbook.SheetNames.includes('參與者清單')) {
          const participantSheet = workbook.Sheets['參與者清單'];
          const participantJsonData = XLSX.utils.sheet_to_json(participantSheet, { header: 1 }) as (string | number)[][];

          for (let i = 1; i < participantJsonData.length; i++) {
            const row = participantJsonData[i];
            if (row && row[0] && row[1]) {
              const listId = String(row[0]).trim();
              const name = String(row[1]).trim();

              // 檢查名單是否存在
              if (!participantsByListId.has(listId)) {
                // 如果名單不存在，使用第一個名單
                const defaultListId = importedLists[0]?.id || '1';
                const participants = participantsByListId.get(defaultListId) || [];
                participants.push({
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  name: name,
                  isSelected: false
                });
                participantsByListId.set(defaultListId, participants);
              } else {
                const participants = participantsByListId.get(listId) || [];
                participants.push({
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  name: name,
                  isSelected: false
                });
                participantsByListId.set(listId, participants);
              }
            }
          }
        }

        // 檢查匯入結果
        const totalParticipants = Array.from(participantsByListId.values()).reduce((sum, p) => sum + p.length, 0);
        if (importedPrizes.length === 0 && totalParticipants === 0) {
          alert('⚠️ 匯入失敗：未找到有效的獎項或參與者資料！\n請確保 Excel 檔案包含正確的工作表和資料格式。');
          return;
        }

        // 組合名單和參與者
        const importedListsWithParticipants: ParticipantListData[] = importedLists.map(list => ({
          list,
          participants: participantsByListId.get(list.id) || []
        }));

        // 更新應用狀態
        setParticipantLists(importedListsWithParticipants);
        if (importedPrizes.length > 0) {
          setPrizes(importedPrizes);
        }

        // 重置其他狀態
        setAllResults([]);
        setState('setup');

        const successMessage = [];
        if (importedLists.length > 0) {
          successMessage.push(`${importedLists.length} 個參與名單`);
        }
        if (importedPrizes.length > 0) {
          successMessage.push(`${importedPrizes.length} 個獎項`);
        }
        if (totalParticipants > 0) {
          successMessage.push(`${totalParticipants} 位參與者`);
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#f5f3e8] via-[#faf5f0] to-[#ffe5e5]">
      <img src="/image copy.png" alt="" className="absolute top-0 right-0 w-64 h-64 object-contain opacity-60" />
      <img src="/image copy.png" alt="" className="absolute bottom-0 left-0 w-48 h-48 object-contain opacity-70 transform scale-x-[-1]" />
      <img src="/image copy.png" alt="" className="absolute top-20 left-10 w-56 h-56 object-contain opacity-50 transform scale-x-[-1] rotate-90" />
      <img src="/image copy.png" alt="" className="absolute bottom-10 right-10 w-40 h-40 object-contain opacity-60 transform rotate-[-30deg]" />

      <header className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <img src={logoUrl} alt="Logo" className="h-10 md:h-12 object-contain flex-shrink-0" />
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 flex-1 justify-center">
              <Sparkles size={24} className="flex-shrink-0" />
              <span className="truncate">{state === 'setup' ? '抽獎系統設定' : state === 'drawing' && currentPrize ? currentPrize.name : settings.title}</span>
              <Sparkles size={24} className="flex-shrink-0" />
            </h1>
            <div className="w-10 md:w-12 flex-shrink-0"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {state === 'setup' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PrizeManager prizes={prizes} participantLists={participantLists} onPrizesChange={setPrizes} />
              <ParticipantManager
                participantLists={participantLists}
                onParticipantListsChange={setParticipantLists}
              />
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-orange-600 flex items-center gap-2">
                  <SettingsIcon size={28} />
                  後台設定
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      活動標題
                    </label>
                    <input
                      type="text"
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                      placeholder="請輸入活動標題"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Logo 圖片
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setLogoUrl(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 file:cursor-pointer"
                      />
                      {logoUrl && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <img src={logoUrl} alt="Logo預覽" className="h-16 object-contain" />
                          <span className="text-sm text-gray-600">當前Logo預覽</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">匯出/匯入功能</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-md font-medium text-gray-600 mb-2">設定檔案</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={exportConfig}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                          >
                            <SettingsIcon size={16} />
                            匯出設定
                          </button>
                          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 cursor-pointer">
                            <SettingsIcon size={16} />
                            匯入設定
                            <input
                              type="file"
                              accept=".json"
                              onChange={importConfig}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          匯出設定可保存當前的獎項、參與者和設定；匯入設定會覆蓋目前所有資料
                        </p>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-600 mb-2">Excel 完整設定</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={downloadExcelTemplate}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                          >
                            <SettingsIcon size={16} />
                            下載Excel模板
                          </button>
                          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 cursor-pointer">
                            <SettingsIcon size={16} />
                            匯入Excel設定
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={importExcelConfig}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Excel模板包含「獎項設定」和「參與者名單」兩個工作表。支援 .xlsx 和 .xls 格式
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <LotterySettings
                settings={settings}
                onSettingsChange={setSettings}
                onExcelImport={importExcelConfig}
              />
            </div>

            <div className="text-center">
              <button
                onClick={completeSettings}
                disabled={participantLists.reduce((sum, list) => sum + list.participants.length, 0) === 0 || prizes.length === 0}
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
            participantLists={participantLists}
            onStartPrizeDraw={startPrizeDraw}
            onBackToSettings={backToSettings}
            allResults={allResults}
          />
        )}

        {state === 'drawing' && currentPrize && (
          <LotteryAnimation
            isVisible={isDrawing}
            participants={effectiveParticipantsForDraw}
            prize={currentPrize}
            onComplete={handleWinnerDataSave}
            onBackToOverview={backToOverview}
            onReset={resetLottery}
            onRedraw={handleRedraw}
            availableParticipants={availableForRedraw}
            logoUrl={logoUrl}
            allParticipants={participantLists.flatMap(l => l.participants)}
            initialWinners={winners}
          />
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