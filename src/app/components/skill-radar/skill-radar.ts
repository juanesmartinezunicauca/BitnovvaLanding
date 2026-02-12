import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';

export interface SkillData {
  webDev: number;
  dataScience: number;
  aiMl: number;
  backend: number;
  devOps: number;
}

@Component({
  selector: 'app-skill-radar',
  imports: [],
  templateUrl: './skill-radar.html',
  styleUrl: './skill-radar.scss',
  standalone: true
})
export class SkillRadar implements AfterViewInit {
  @ViewChild('radarCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() skills: SkillData = {
    webDev: 85,
    dataScience: 70,
    aiMl: 90,
    backend: 95,
    devOps: 80
  };

  private ctx!: CanvasRenderingContext2D;
  private centerX = 100;
  private centerY = 100;
  private maxRadius = 80;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.drawRadar();
  }

  private drawRadar(): void {
    // Draw background pentagon levels
    this.drawPentagonLevels();

    // Draw skill area
    this.drawSkillArea();

    // Draw axes
    this.drawAxes();
  }

  private drawPentagonLevels(): void {
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      const radius = (this.maxRadius / levels) * i;
      this.drawPentagon(radius, 'rgba(152, 151, 244, 0.2)', 1);
    }
  }

  private drawPentagon(radius: number, color: string, lineWidth: number): void {
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = this.centerX + radius * Math.cos(angle);
      const y = this.centerY + radius * Math.sin(angle);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }

  private drawSkillArea(): void {
    const skillValues = [
      this.skills.webDev,
      this.skills.dataScience,
      this.skills.aiMl,
      this.skills.backend,
      this.skills.devOps
    ];

    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const radius = (this.maxRadius * skillValues[i]) / 100;
      const x = this.centerX + radius * Math.cos(angle);
      const y = this.centerY + radius * Math.sin(angle);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();

    // Fill
    const gradient = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, this.maxRadius
    );
    gradient.addColorStop(0, 'rgba(152, 151, 244, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Stroke
    this.ctx.strokeStyle = '#9897f4';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private drawAxes(): void {
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = this.centerX + this.maxRadius * Math.cos(angle);
      const y = this.centerY + this.maxRadius * Math.sin(angle);

      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = 'rgba(152, 151, 244, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }
}
