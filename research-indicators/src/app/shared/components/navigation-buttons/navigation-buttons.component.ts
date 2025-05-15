import { NgStyle } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SubmissionService } from '@shared/services/submission.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navigation-buttons',
  imports: [NgStyle, ButtonModule],
  templateUrl: './navigation-buttons.component.html'
})
export class NavigationButtonsComponent {
  submission = inject(SubmissionService);

  @Input() showBack = true;
  @Input() showNext = true;
  @Input() showSave = false;
  @Input() disableSave = false;
  @Input() disableNext = false;

  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
}
