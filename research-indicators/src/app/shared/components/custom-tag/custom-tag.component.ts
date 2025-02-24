import { Component, Input } from '@angular/core';

interface Colors {
  [key: string]: { border: string; text: string };
}

@Component({
  selector: 'app-custom-tag',
  imports: [],
  templateUrl: './custom-tag.component.html'
})
export class CustomTagComponent {
  @Input() statusId: string | number = '';
  @Input() statusName: string = '';

  getColors: Colors = {
    '0': { border: '#79D9FF', text: '#1689CA' },
    '1': { border: '#79D9FF', text: '#1689CA' },
    '2': { border: '#7C9CB9', text: '#173F6F' },
    '3': { border: '#A8CEAB', text: '#7CB580' }
  };
}
