import { Component, Input } from '@angular/core';
import { STATUS_COLOR_MAP } from '@shared/constants/status-colors';

type ColorMap = Record<
  string,
  {
    border: string;
    text: string;
  }
>;

@Component({
  selector: 'app-custom-tag',
  imports: [],
  templateUrl: './custom-tag.component.html'
})
export class CustomTagComponent {
  @Input() statusId: string | number = '';
  @Input() statusName = '';

  getColors() {
    const status = String(this.statusId);
    return STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP[''];
  }
}
