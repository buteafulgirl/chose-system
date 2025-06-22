import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react';
import { Participant } from '../types/lottery';

interface ParticipantManagerProps {
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({ 
  participants, 
  onParticipantsChange 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newParticipant, setNewParticipant] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  const addParticipant = () => {
    if (newParticipant.trim()) {
      const participant: Participant = {
        id: Date.now().toString(),
        name: newParticipant.trim()
      };
      onParticipantsChange([...participants, participant]);
      setNewParticipant('');
    }
  };

  const addBulkParticipants = () => {
    const names = bulkInput
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    const newParticipants = names.map(name => ({
      id: `${Date.now()}-${Math.random()}`,
      name
    }));
    
    onParticipantsChange([...participants, ...newParticipants]);
    setBulkInput('');
    setShowBulkInput(false);
  };

  const startEdit = (participant: Participant) => {
    setEditingId(participant.id);
    setEditValue(participant.name);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      onParticipantsChange(participants.map(p => 
        p.id === editingId ? { ...p, name: editValue.trim() } : p
      ));
    }
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const deleteParticipant = (id: string) => {
    onParticipantsChange(participants.filter(p => p.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
          <Users size={16} className="text-white" />
        </div>
        參與名單 ({participants.length} 人)
      </h3>
      
      <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {editingId === participant.id ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                />
                <button
                  onClick={saveEdit}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-gray-800">{participant.name}</span>
                <button
                  onClick={() => startEdit(participant)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => deleteParticipant(participant.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {showBulkInput ? (
        <div className="space-y-3 mb-4">
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="每行輸入一個姓名..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={addBulkParticipants}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              批量新增
            </button>
            <button
              onClick={() => {
                setShowBulkInput(false);
                setBulkInput('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
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
          <button
            onClick={() => setShowBulkInput(true)}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            批量輸入
          </button>
        </div>
      )}
    </div>
  );
};