import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {
  // Definición de la señal de steps
  activeIndex = signal(0);
  steps = signal([
    { label: 'Uploading document', completed: true, inProgress: false, progress: 0 },
    { label: 'Reading content', completed: false, inProgress: true, progress: 0 },
    { label: 'Analyzing text', completed: false, inProgress: false, progress: 0 },
    { label: 'Finding relevant content', completed: false, inProgress: false, progress: 0 },
    { label: 'Generating response', completed: false, inProgress: false, progress: 0 }
  ]);

  startProgress(): void {
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < this.steps().length) {
        this.updateProgress(currentStep);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 4000);
  }

  updateProgress(stepIndex: number): void {
    const step = this.steps()[stepIndex];
    step.inProgress = true;

    const progressInterval = setInterval(() => {
      if (step.progress < 100) {
        step.progress += 10;
        this.steps.update(steps => {
          steps[stepIndex] = step;
          return [...steps];
        });
      } else {
        clearInterval(progressInterval);
        step.completed = true;
        step.inProgress = false;
        this.steps.update(steps => {
          steps[stepIndex] = step;
          return [...steps];
        });
      }
    }, 300);
  }

  ngOnInit(): void {
    this.startProgress();
  }
}
