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