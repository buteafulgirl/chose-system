import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Prize, Participant } from '../types/lottery';

interface PrizeManagerProps {
  prizes: Prize[];
  onPrizesChange: (prizes: Prize[]) => void;
  participants: Participant[];
}

export const PrizeManager: React.FC<PrizeManagerProps> = ({ prizes, onPrizesChange, participants }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDrawCount, setEditDrawCount] = useState('1');
  const [newPrize, setNewPrize] = useState('');
  const [newDrawCount, setNewDrawCount] = useState('1');
  const [expandedPrizeId, setExpandedPrizeId] = useState<string | null>(null);

  const addPrize = () => {
    if (newPrize.trim()) {
      const drawCount = Math.max(1, parseInt(newDrawCount) || 1);
      const prize: Prize = {
        id: Date.now().toString(),
        name: newPrize.trim(),
        drawCount,
        participantIds: participants.map(p => p.id) // 預設包含所有參與者
      };
      onPrizesChange([...prizes, prize]);
      setNewPrize('');
      setNewDrawCount('1');
    }
  };

  const startEdit = (prize: Prize) => {
    setEditingId(prize.id);
    setEditValue(prize.name);
    setEditDrawCount(prize.drawCount.toString());
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      const drawCount = Math.max(1, parseInt(editDrawCount) || 1);
      onPrizesChange(prizes.map(p => 
        p.id === editingId ? { ...p, name: editValue.trim(), drawCount } : p
      ));
    }
    setEditingId(null);
    setEditValue('');
    setEditDrawCount('1');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditDrawCount('1');
  };

  const deletePrize = (id: string) => {
    onPrizesChange(prizes.filter(p => p.id !== id));
  };

  const toggleParticipant = (prizeId: string, participantId: string) => {
    onPrizesChange(prizes.map(prize => {
      if (prize.id === prizeId) {
        const isSelected = prize.participantIds.includes(participantId);
        return {
          ...prize,
          participantIds: isSelected
            ? prize.participantIds.filter(id => id !== participantId)
            : [...prize.participantIds, participantId]
        };
      }
      return prize;
    }));
  };

  const toggleAllParticipants = (prizeId: string) => {
    onPrizesChange(prizes.map(prize => {
      if (prize.id === prizeId) {
        const allSelected = prize.participantIds.length === participants.length;
        return {
          ...prize,
          participantIds: allSelected ? [] : participants.map(p => p.id)
        };
      }
      return prize;
    }));
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
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="獎項名稱"
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                />
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
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium">{prize.name}</div>
                    <div className="text-sm text-orange-600">抽獎人數: {prize.drawCount} 人</div>
                    <div className="text-sm text-blue-600">參與者: {prize.participantIds.length} 人</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedPrizeId(expandedPrizeId === prize.id ? null : prize.id)}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="管理參與者"
                    >
                      {expandedPrizeId === prize.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
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
                {expandedPrizeId === prize.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users size={16} />
                        選擇參與此獎項抽獎的人員
                      </span>
                      <button
                        onClick={() => toggleAllParticipants(prize.id)}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        {prize.participantIds.length === participants.length ? '取消全選' : '全選'}
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {participants.map(participant => (
                        <label key={participant.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prize.participantIds.includes(participant.id)}
                            onChange={() => toggleParticipant(prize.id, participant.id)}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{participant.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
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