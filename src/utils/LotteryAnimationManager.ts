import { AnimationState, AnimationContext, PerformanceLevel } from '../types/lottery';
import { AudioManager } from './AudioManager';

export class LotteryAnimationManager {
  private audioManager: AudioManager;
  private performanceLevel: PerformanceLevel;
  private animationCallbacks: Map<AnimationState, (() => void)[]> = new Map();
  private currentContext: AnimationContext | null = null;

  constructor() {
    this.audioManager = new AudioManager();
    this.performanceLevel = this.detectPerformanceLevel();
    this.initializeCallbacks();
  }

  private detectPerformanceLevel(): PerformanceLevel {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const canvas = document.createElement('canvas');
    const hasGPU = !!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl');
    
    if (isMobile || !hasGPU) return PerformanceLevel.LOW;
    
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (memory && memory < 4) return PerformanceLevel.MEDIUM;
    
    return PerformanceLevel.HIGH;
  }

  private initializeCallbacks(): void {
    const states: AnimationState[] = ['idle', 'preparing', 'activating', 'shuffling', 'revealing', 'celebrating'];
    states.forEach(state => {
      this.animationCallbacks.set(state, []);
    });
  }

  public onStateChange(state: AnimationState, callback: () => void): void {
    const callbacks = this.animationCallbacks.get(state);
    if (callbacks) {
      callbacks.push(callback);
    }
  }

  private triggerStateCallbacks(state: AnimationState): void {
    const callbacks = this.animationCallbacks.get(state);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  public async startDrawing(context: AnimationContext): Promise<void> {
    this.currentContext = context;
    
    try {
      this.triggerStateCallbacks('preparing');
      await this.runPreparationPhase();
      
      this.triggerStateCallbacks('activating');
      await this.runActivationPhase();
      
      this.triggerStateCallbacks('shuffling');
      await this.runShufflingPhase(context.participants);
      
      this.triggerStateCallbacks('revealing');
      await this.runRevelationPhase(context.winners);
      
      this.triggerStateCallbacks('celebrating');
      await this.runCelebrationPhase();
      
      this.triggerStateCallbacks('idle');
    } catch (error) {
      console.error('Animation sequence failed:', error);
      this.triggerStateCallbacks('idle');
    }
  }

  private async runPreparationPhase(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await this.audioManager.playWithPool('countdown');
        } catch (error) {
          console.warn('Countdown audio failed:', error);
        }
        resolve();
      }, 3000); // 3 seconds for countdown
    });
  }

  private async runActivationPhase(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await this.audioManager.playWithPool('magic-activation');
        } catch (error) {
          console.warn('Magic activation audio failed:', error);
        }
        resolve();
      }, 2000); // 2 seconds for magic activation
    });
  }

  private async runShufflingPhase(participants: unknown[]): Promise<void> {
    const duration = Math.min(6000, Math.max(4000, participants.length * 50)); // 4-6 seconds based on participant count
    
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await this.audioManager.playWithPool('shuffling');
        } catch (error) {
          console.warn('Shuffling audio failed:', error);
        }
        resolve();
      }, duration);
    });
  }

  private async runRevelationPhase(winners: unknown[]): Promise<void> {
    const duration = winners.length * 2000; // 2 seconds per winner
    
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await this.audioManager.playWithPool('victory');
        } catch (error) {
          console.warn('Victory audio failed:', error);
        }
        resolve();
      }, duration);
    });
  }

  private async runCelebrationPhase(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await this.audioManager.playWithPool('celebration');
        } catch (error) {
          console.warn('Celebration audio failed:', error);
        }
        resolve();
      }, 3000); // 3 seconds for celebration
    });
  }

  public stopAnimation(): void {
    this.audioManager.stopAll();
    this.triggerStateCallbacks('idle');
  }

  public setVolume(volume: number): void {
    this.audioManager.setVolume(volume);
  }

  public toggleMute(): void {
    this.audioManager.toggleMute();
  }

  public get volume(): number {
    return this.audioManager.volume;
  }

  public get muted(): boolean {
    return this.audioManager.muted;
  }

  public get currentPerformanceLevel(): PerformanceLevel {
    return this.performanceLevel;
  }

  public setPerformanceLevel(level: PerformanceLevel): void {
    this.performanceLevel = level;
  }
}