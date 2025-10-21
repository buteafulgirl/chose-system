import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react';
import { Participant, ParticipantList, ParticipantListData } from '../types/lottery';

interface ParticipantManagerProps {
  participantLists: ParticipantListData[];
  onParticipantListsChange: (lists: ParticipantListData[]) => void;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participantLists,
  onParticipantListsChange
}) => {
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [selectedListForNewParticipant, setSelectedListForNewParticipant] = useState<string>('');
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [editParticipantName, setEditParticipantName] = useState('');

  // 确保 selectedListForNewParticipant 总是有效的
  React.useEffect(() => {
    if (!selectedListForNewParticipant && participantLists.length > 0) {
      setSelectedListForNewParticipant(participantLists[0].list.id);
    }
  }, [participantLists, selectedListForNewParticipant]);

  // 添加參與名單
  const addParticipantList = () => {
    if (newListName.trim()) {
      const newList: ParticipantListData = {
        list: {
          id: Date.now().toString(),
          name: newListName.trim()
        },
        participants: []
      };
      onParticipantListsChange([...participantLists, newList]);
      setNewListName('');
    }
  };

  // 編輯參與名單
  const startEditList = (list: ParticipantList) => {
    setEditingListId(list.id);
    setEditListName(list.name);
  };

  const saveEditList = () => {
    if (editListName.trim()) {
      onParticipantListsChange(participantLists.map(listData =>
        listData.list.id === editingListId
          ? { ...listData, list: { ...listData.list, name: editListName.trim() } }
          : listData
      ));
    }
    setEditingListId(null);
    setEditListName('');
  };

  const cancelEditList = () => {
    setEditingListId(null);
    setEditListName('');
  };

  // 刪除參與名單
  const deleteParticipantList = (listId: string) => {
    // 不允許刪除有參與者的名單
    const listData = participantLists.find(l => l.list.id === listId);
    if (listData && listData.participants.length > 0) {
      alert('⚠️ 無法刪除此名單：該名單中還有參與者');
      return;
    }
    onParticipantListsChange(participantLists.filter(l => l.list.id !== listId));
  };

  // 添加參與者到名單
  const addParticipant = () => {
    if (newParticipantName.trim() && selectedListForNewParticipant) {
      onParticipantListsChange(participantLists.map(listData =>
        listData.list.id === selectedListForNewParticipant
          ? {
              ...listData,
              participants: [
                ...listData.participants,
                {
                  id: Date.now().toString(),
                  name: newParticipantName.trim()
                }
              ]
            }
          : listData
      ));
      setNewParticipantName('');
    }
  };

  // 編輯參與者
  const startEditParticipant = (participantId: string, name: string) => {
    setEditingParticipantId(participantId);
    setEditParticipantName(name);
  };

  const saveEditParticipant = () => {
    if (editParticipantName.trim()) {
      onParticipantListsChange(participantLists.map(listData => ({
        ...listData,
        participants: listData.participants.map(p =>
          p.id === editingParticipantId
            ? { ...p, name: editParticipantName.trim() }
            : p
        )
      })));
    }
    setEditingParticipantId(null);
    setEditParticipantName('');
  };

  const cancelEditParticipant = () => {
    setEditingParticipantId(null);
    setEditParticipantName('');
  };

  // 刪除參與者
  const deleteParticipant = (listId: string, participantId: string) => {
    onParticipantListsChange(participantLists.map(listData =>
      listData.list.id === listId
        ? {
            ...listData,
            participants: listData.participants.filter(p => p.id !== participantId)
          }
        : listData
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
          <Users size={16} className="text-white" />
        </div>
        參與名單管理
      </h3>

      <div className="space-y-6">
        {/* 參與名單列表 */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700 mb-2">名單列表</div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {participantLists.map((listData) => (
              <div key={listData.list.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  {editingListId === listData.list.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editListName}
                        onChange={(e) => setEditListName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && saveEditList()}
                      />
                      <button
                        onClick={saveEditList}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={cancelEditList}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{listData.list.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {listData.participants.length} 位參與者
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditList(listData.list)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        {listData.participants.length === 0 && (
                          <button
                            onClick={() => deleteParticipantList(listData.list.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* 該名單下的參與者 */}
                <div className="ml-2 border-l-2 border-gray-200 pl-3 space-y-2">
                  {listData.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2 p-2 bg-white rounded">
                      {editingParticipantId === participant.id ? (
                        <>
                          <input
                            type="text"
                            value={editParticipantName}
                            onChange={(e) => setEditParticipantName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && saveEditParticipant()}
                          />
                          <button
                            onClick={saveEditParticipant}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={cancelEditParticipant}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-gray-700">{participant.name}</span>
                          <button
                            onClick={() => startEditParticipant(participant.id, participant.name)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteParticipant(listData.list.id, participant.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 新增名單 */}
        <div className="border-t pt-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">新增名單</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="輸入名單名稱..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addParticipantList()}
            />
            <button
              onClick={addParticipantList}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              新增
            </button>
          </div>
        </div>

        {/* 新增參與者 */}
        <div className="border-t pt-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">新增參與者</div>
          <div className="space-y-3">
            <select
              value={selectedListForNewParticipant}
              onChange={(e) => setSelectedListForNewParticipant(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {participantLists.map(listData => (
                <option key={listData.list.id} value={listData.list.id}>
                  {listData.list.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                placeholder="輸入參與者姓名..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
              />
              <button
                onClick={addParticipant}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                新增
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
