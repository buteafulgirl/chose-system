export interface ParticipantList {
  id: string;
  name: string;
}

export interface Prize {
  id: string;
  number: number;              // 自動編號（從1開始）
  name: string;
  drawCount: number;
  participantListId?: string;  // 綁定的名單ID（optional = 所有名單都可）
}

export interface Participant {
  id: string;
  name: string;
  isSelected?: boolean;
  isAbsent?: boolean;
}

export interface LotterySettings {
  allowRepeat: boolean;
  title: string;
}

export interface LotteryResult {
  winners: Participant[];
  prize: Prize;
}

export interface RedrawRequest {
  absentWinners: Participant[];
  presentWinners: Participant[];
  prize: Prize;
  redrawCount: number;
}

export interface ParticipantListData {
  list: ParticipantList;
  participants: Participant[];
}

export interface LotteryConfig {
  version: string;
  exportDate: string;
  prizes: Prize[];
  participantLists: ParticipantListData[];  // 名單及其參與者
  settings: LotterySettings;
}

export type AnimationState = 
  | 'idle'           // 空閒狀態
  | 'preparing'      // 準備倒數
  | 'activating'     // 魔法啟動
  | 'shuffling'      // 名單混合
  | 'revealing'      // 結果揭曉
  | 'celebrating'    // 慶祝展示

