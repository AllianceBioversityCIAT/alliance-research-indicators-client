import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @ViewChild('tiltBox') tiltBox!: ElementRef;

  private readonly maxTilt = 3; // Reduced from 10 to 3 degrees for subtler effect

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const element = this.tiltBox?.nativeElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate percentage position
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Calculate tilt angles - inverted the signs to reverse the effect
    const tiltX = -((yPercent - 50) / 50) * this.maxTilt;
    const tiltY = -((50 - xPercent) / 50) * this.maxTilt;

    // Apply the transform
    element.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    const element = this.tiltBox?.nativeElement;
    if (!element) return;

    // Reset the transform when mouse leaves
    element.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }
}
