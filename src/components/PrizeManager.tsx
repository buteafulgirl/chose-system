import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Prize, ParticipantListData } from '../types/lottery';

interface PrizeManagerProps {
  prizes: Prize[];
  participantLists: ParticipantListData[];
  onPrizesChange: (prizes: Prize[]) => void;
}

export const PrizeManager: React.FC<PrizeManagerProps> = ({
  prizes,
  participantLists,
  onPrizesChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDrawCount, setEditDrawCount] = useState('1');
  const [editListId, setEditListId] = useState<string | undefined>(undefined);
  const [newPrize, setNewPrize] = useState('');
  const [newDrawCount, setNewDrawCount] = useState('1');
  const [newListId, setNewListId] = useState<string | undefined>(undefined);

  const getNextPrizeNumber = (): number => {
    if (prizes.length === 0) return 1;
    return Math.max(...prizes.map(p => p.number)) + 1;
  };

  // 獲取已綁定的名單ID集合（不包括當前編輯的獎項）
  const getUsedListIds = (excludePrizeId?: string): Set<string> => {
    return new Set(
      prizes
        .filter(p => (!excludePrizeId || p.id !== excludePrizeId) && p.participantListId)
        .map(p => p.participantListId!)
    );
  };

  // 獲取可用的名單（未被綁定的）
  const getAvailableLists = (excludePrizeId?: string): ParticipantListData[] => {
    const usedIds = getUsedListIds(excludePrizeId);
    return participantLists.filter(l => !usedIds.has(l.list.id));
  };

  const addPrize = () => {
    if (newPrize.trim()) {
      const drawCount = Math.max(1, parseInt(newDrawCount) || 1);
      const prize: Prize = {
        id: Date.now().toString(),
        number: getNextPrizeNumber(),
        name: newPrize.trim(),
        drawCount,
        participantListId: newListId
      };
      onPrizesChange([...prizes, prize]);
      setNewPrize('');
      setNewDrawCount('1');
      setNewListId(undefined);
    }
  };

  const startEdit = (prize: Prize) => {
    setEditingId(prize.id);
    setEditValue(prize.name);
    setEditDrawCount(prize.drawCount.toString());
    setEditListId(prize.participantListId);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      const drawCount = Math.max(1, parseInt(editDrawCount) || 1);
      onPrizesChange(prizes.map(p =>
        p.id === editingId
          ? { ...p, name: editValue.trim(), drawCount, participantListId: editListId }
          : p
      ));
    }
    setEditingId(null);
    setEditValue('');
    setEditDrawCount('1');
    setEditListId(undefined);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditDrawCount('1');
    setEditListId(undefined);
  };

  const deletePrize = (id: string) => {
    onPrizesChange(prizes.filter(p => p.id !== id));
  };

  const getListName = (listId: string | undefined): string => {
    if (!listId) return '所有名單皆可參與';
    return participantLists.find(l => l.list.id === listId)?.list.name || '未知名單';
  };

  // 檢查名單是否已被使用
  const isListUsed = (listId: string, excludePrizeId?: string): boolean => {
    return getUsedListIds(excludePrizeId).has(listId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold">🎁</span>
        </div>
        獎項設定
      </h3>

      <div className="space-y-3 mb-4">
        {prizes.map((prize) => (
          <div key={prize.id} className="p-4 bg-gray-50 rounded-lg">
            {editingId === prize.id ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full font-bold text-sm flex-shrink-0">
                    #{prize.number}
                  </div>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="獎項名稱"
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">抽獎人數:</label>
                  <input
                    type="text"
                    value={editDrawCount}
                    onChange={(e) => setEditDrawCount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">綁定名單:</label>
                  <select
                    value={editListId || ''}
                    onChange={(e) => setEditListId(e.target.value ? e.target.value : undefined)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">所有名單皆可參與</option>
                    {participantLists.map(listData => {
                      const isCurrentSelection = editListId === listData.list.id;
                      const isUsed = isListUsed(listData.list.id, prize.id);
                      const isAvailable = isCurrentSelection || !isUsed;

                      return (
                        <option
                          key={listData.list.id}
                          value={listData.list.id}
                          disabled={!isAvailable}
                        >
                          {listData.list.name}
                          {isUsed && !isCurrentSelection ? ' (已使用)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    儲存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full font-bold text-sm">
                      #{prize.number}
                    </div>
                    <span className="text-gray-800 font-medium">{prize.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 ml-10">
                    <div className="text-orange-600">抽獎人數: {prize.drawCount} 人</div>
                    <div className={prize.participantListId ? 'text-blue-600' : 'text-gray-500'}>
                      綁定名單: {getListName(prize.participantListId)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(prize)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deletePrize(prize.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="text-sm font-medium text-gray-700">新增獎項</div>
        <input
          type="text"
          value={newPrize}
          onChange={(e) => setNewPrize(e.target.value)}
          placeholder="輸入新獎項名稱..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          onKeyPress={(e) => e.key === 'Enter' && addPrize()}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">抽獎人數:</label>
          <input
            type="text"
            value={newDrawCount}
            onChange={(e) => setNewDrawCount(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="1"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">綁定名單:</label>
          <select
            value={newListId || ''}
            onChange={(e) => setNewListId(e.target.value ? e.target.value : undefined)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">所有名單皆可參與</option>
            {getAvailableLists().map(listData => (
              <option key={listData.list.id} value={listData.list.id}>
                {listData.list.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addPrize}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          新增獎項
        </button>
      </div>
    </div>
  );
};
