export class AudioManager {
  private audioPool: Map<string, HTMLAudioElement[]> = new Map();
  private currentVolume: number = 0.7;
  private isMuted: boolean = false;

  constructor() {
    this.preloadAudio([
      'countdown', 
      'magic-activation', 
      'shuffling', 
      'victory', 
      'celebration'
    ]);
  }

  private preloadAudio(audioIds: string[]): void {
    audioIds.forEach(id => {
      const audioPool: HTMLAudioElement[] = [];
      for (let i = 0; i < 3; i++) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = this.currentVolume;
        audioPool.push(audio);
      }
      this.audioPool.set(id, audioPool);
    });
  }

  private getAvailableAudio(audioId: string): HTMLAudioElement | null {
    const pool = this.audioPool.get(audioId);
    if (!pool) return null;

    return pool.find(audio => audio.paused) || pool[0];
  }

  public playWithPool(audioId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isMuted) {
        resolve();
        return;
      }

      const audio = this.getAvailableAudio(audioId);
      if (!audio) {
        reject(new Error(`Audio ${audioId} not found`));
        return;
      }

      audio.currentTime = 0;
      audio.volume = this.currentVolume;
      
      const handleEnded = () => {
        audio.removeEventListener('ended', handleEnded);
        resolve();
      };

      audio.addEventListener('ended', handleEnded);
      audio.play().catch(reject);
    });
  }

  public stopAll(): void {
    this.audioPool.forEach(pool => {
      pool.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    });
  }

  public setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    this.audioPool.forEach(pool => {
      pool.forEach(audio => {
        audio.volume = this.currentVolume;
      });
    });
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.audioPool.forEach(pool => {
      pool.forEach(audio => {
        audio.volume = this.isMuted ? 0 : this.currentVolume;
      });
    });
  }

  public get volume(): number {
    return this.currentVolume;
  }

  public get muted(): boolean {
    return this.isMuted;
  }
}