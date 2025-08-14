import { Component } from '@angular/core';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';

@Component({
  selector: 'app-contributions-to-indicators',
  imports: [FormHeaderComponent, NavigationButtonsComponent],
  templateUrl: './contributions-to-indicators.component.html',
  styleUrl: './contributions-to-indicators.component.scss'
})
export default class ContributionsToIndicatorsComponent {
  saveData = (option?: 'back' | 'next' | 'save') => {
    return option;
  };
}
