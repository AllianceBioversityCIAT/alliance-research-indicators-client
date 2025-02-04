import { Component } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-custom-progress-bar',
  standalone: true,
  imports: [ProgressBarModule],
  templateUrl: './custom-progress-bar.component.html',
  styleUrl: './custom-progress-bar.component.scss'
})
export class CustomProgressBarComponent {}
