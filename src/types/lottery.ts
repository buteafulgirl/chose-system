export interface Prize {
  id: string;
  name: string;
  drawCount: number;
}

export interface Participant {
  id: string;
  name: string;
  isSelected?: boolean;
}

export interface LotterySettings {
  allowRepeat: boolean;
  title: string;
}

export interface LotteryResult {
  winners: Participant[];
  prize: Prize;
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

export interface AnimationContext {
  currentState: AnimationState;
  progress: number;        // 當前階段進度 0-1
  participants: Participant[];
  winners: Participant[];
  prizeInfo: Prize;
}

export enum PerformanceLevel {
  LOW = 'low',        // 基本動畫，無粒子效果
  MEDIUM = 'medium',  // 標準動畫，簡化粒子
  HIGH = 'high'       // 完整特效體驗
}