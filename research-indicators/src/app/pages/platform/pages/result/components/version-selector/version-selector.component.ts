import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-version-selector',
  templateUrl: './version-selector.component.html',
  standalone: true,
  imports: [ButtonModule, DividerModule]
})
export class VersionSelectorComponent {
  versions = ['2024', '2023'];
  selectedVersion = 'live';

  selectVersion(version: string) {
    this.selectedVersion = version;
  }
}
