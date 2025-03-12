import { Component, Input } from '@angular/core';

type Colors = Record<string, { border: string; text: string }>;

@Component({
  selector: 'app-custom-tag',
  imports: [],
  templateUrl: './custom-tag.component.html'
})
export class CustomTagComponent {
  @Input() statusId: string | number = '';
  @Input() statusName = '';

  getColors(): { border: string; text: string } {
    const id = this.statusId.toString();

    switch (id) {
      case '':
      case '0':
      case '1':
        return { border: '#79D9FF', text: '#1689CA' };
      case '2':
        return { border: '#7C9CB9', text: '#173F6F' };
      case '3':
        return { border: '#A8CEAB', text: '#7CB580' };
      default:
        return { border: '#79D9FF', text: '#1689CA' }; // Default case
    }
  }
}
