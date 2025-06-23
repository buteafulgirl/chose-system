export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'star' | 'circle' | 'sparkle';
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private nextId = 0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;

  constructor(canvasElement?: HTMLCanvasElement) {
    if (canvasElement) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext('2d');
    }
  }

  public createParticle(config: Partial<Particle> & { x: number; y: number }): void {
    const particle: Particle = {
      id: this.nextId++,
      x: config.x,
      y: config.y,
      vx: config.vx || (Math.random() - 0.5) * 4,
      vy: config.vy || (Math.random() - 0.5) * 4,
      life: config.life || 60,
      maxLife: config.maxLife || 60,
      size: config.size || 4 + Math.random() * 8,
      color: config.color || '#FFD700',
      type: config.type || 'circle'
    };

    this.particles.push(particle);
  }

  public createBurst(x: number, y: number, count: number = 20, colors: string[] = ['#FFD700', '#FF6B6B', '#4ECDC4']): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      
      this.createParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 40 + Math.random() * 40,
        maxLife: 80,
        type: Math.random() > 0.5 ? 'star' : 'sparkle'
      });
    }
  }

  public update(): void {
    this.particles = this.particles.filter(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply gravity for some particle types
      if (particle.type === 'circle') {
        particle.vy += 0.1;
      }
      
      // Reduce life
      particle.life--;
      
      // Remove dead particles
      return particle.life > 0;
    });
  }

  public render(): void {
    if (!this.ctx || !this.canvas) return;

    this.particles.forEach(particle => {
      if (!this.ctx) return;
      
      const alpha = particle.life / particle.maxLife;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      
      this.ctx.fillStyle = particle.color;
      
      switch (particle.type) {
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
          this.ctx.fill();
          break;
          
        case 'star':
          this.drawStar(particle.x, particle.y, particle.size * alpha);
          break;
          
        case 'sparkle':
          this.drawSparkle(particle.x, particle.y, particle.size * alpha);
          break;
      }
      
      this.ctx.restore();
    });
  }

  private drawStar(x: number, y: number, size: number): void {
    if (!this.ctx) return;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.beginPath();
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5;
      const outerX = Math.cos(angle) * size;
      const outerY = Math.sin(angle) * size;
      const innerX = Math.cos(angle + Math.PI / 5) * size * 0.5;
      const innerY = Math.sin(angle + Math.PI / 5) * size * 0.5;
      
      if (i === 0) {
        this.ctx.moveTo(outerX, outerY);
      } else {
        this.ctx.lineTo(outerX, outerY);
      }
      this.ctx.lineTo(innerX, innerY);
    }
    
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawSparkle(x: number, y: number, size: number): void {
    if (!this.ctx) return;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.ctx.fillStyle as string;
    
    // Draw cross
    this.ctx.beginPath();
    this.ctx.moveTo(-size, 0);
    this.ctx.lineTo(size, 0);
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(0, size);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  public start(): void {
    if (this.animationId) return;
    
    const animate = () => {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public clear(): void {
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public get particleCount(): number {
    return this.particles.length;
  }
}