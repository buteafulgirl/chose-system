import { PerformanceLevel } from '../types/lottery';

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private performanceLevel: PerformanceLevel;
  private observers: ((level: PerformanceLevel) => void)[] = [];

  private constructor() {
    this.performanceLevel = this.detectPerformanceLevel();
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private detectPerformanceLevel(): PerformanceLevel {
    // Check device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Check GPU support
    const canvas = document.createElement('canvas');
    const hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    
    // Check memory (if available)
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    
    // Check CPU cores
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    
    // Scoring system
    let score = 0;
    
    if (!isMobile) score += 2;
    if (hasWebGL) score += 2;
    if (deviceMemory >= 4) score += 2;
    if (hardwareConcurrency >= 4) score += 1;
    
    // Determine performance level
    if (score >= 5) return PerformanceLevel.HIGH;
    if (score >= 3) return PerformanceLevel.MEDIUM;
    return PerformanceLevel.LOW;
  }

  private setupPerformanceMonitoring(): void {
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust performance level based on FPS
        if (fps < 30 && this.performanceLevel !== PerformanceLevel.LOW) {
          this.setPerformanceLevel(PerformanceLevel.LOW);
        } else if (fps >= 55 && this.performanceLevel === PerformanceLevel.LOW) {
          this.setPerformanceLevel(PerformanceLevel.MEDIUM);
        }
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    requestAnimationFrame(checkPerformance);
  }

  public getPerformanceLevel(): PerformanceLevel {
    return this.performanceLevel;
  }

  public setPerformanceLevel(level: PerformanceLevel): void {
    if (this.performanceLevel !== level) {
      this.performanceLevel = level;
      this.notifyObservers();
    }
  }

  public onPerformanceLevelChange(callback: (level: PerformanceLevel) => void): void {
    this.observers.push(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.performanceLevel));
  }

  public getOptimizedParticleCount(): number {
    switch (this.performanceLevel) {
      case PerformanceLevel.LOW: return 10;
      case PerformanceLevel.MEDIUM: return 30;
      case PerformanceLevel.HIGH: return 100;
      default: return 10;
    }
  }

  public getOptimizedAnimationDuration(): number {
    switch (this.performanceLevel) {
      case PerformanceLevel.LOW: return 0.5; // 50% speed
      case PerformanceLevel.MEDIUM: return 0.75; // 75% speed
      case PerformanceLevel.HIGH: return 1; // Full speed
      default: return 0.5;
    }
  }

  public shouldUseReducedMotion(): boolean {
    // Check user preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion || this.performanceLevel === PerformanceLevel.LOW;
  }

  public getOptimizedCardCount(totalParticipants: number): number {
    const maxCards = {
      [PerformanceLevel.LOW]: 15,
      [PerformanceLevel.MEDIUM]: 30,
      [PerformanceLevel.HIGH]: 50
    };

    return Math.min(totalParticipants, maxCards[this.performanceLevel]);
  }

  public shouldUseGPUAcceleration(): boolean {
    return this.performanceLevel !== PerformanceLevel.LOW;
  }

  public getDebugInfo(): Record<string, unknown> {
    return {
      performanceLevel: this.performanceLevel,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      hasWebGL: !!(document.createElement('canvas').getContext('webgl')),
      deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }
}