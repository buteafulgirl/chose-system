export interface Prize {
  id: string;
  name: string;
  drawCount: number;
  participantIds: string[]; // 參與此獎項抽獎的參與者ID列表
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

export interface LotteryConfig {
  version: string;
  exportDate: string;
  prizes: Prize[];
  participants: Participant[];
  settings: LotterySettings;
}

export type AnimationState = 
  | 'idle'           // 空閒狀態
  | 'preparing'      // 準備倒數
  | 'activating'     // 魔法啟動
  | 'shuffling'      // 名單混合
  | 'revealing'      // 結果揭曉
  | 'celebrating'    // 慶祝展示

