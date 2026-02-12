import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appWaveEffect]',
  standalone: true
})
export class WaveEffect {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    // Ensure the host element has position relative
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    this.createWave(event);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    // Create subtle wave on mouse move (throttled by CSS animation)
    if (Math.random() > 0.95) { // Only 5% of mousemove events create waves
      this.createWave(event, 0.3);
    }
  }

  private createWave(event: MouseEvent, opacity: number = 1): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create wave element
    const wave = this.renderer.createElement('span');
    this.renderer.addClass(wave, 'wave-ripple');
    this.renderer.setStyle(wave, 'left', `${x}px`);
    this.renderer.setStyle(wave, 'top', `${y}px`);
    this.renderer.setStyle(wave, 'opacity', opacity.toString());

    // Append to host element
    this.renderer.appendChild(this.el.nativeElement, wave);

    // Remove after animation completes
    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, wave);
    }, 600);
  }
}
