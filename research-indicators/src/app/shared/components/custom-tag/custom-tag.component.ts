import { Component, Input } from '@angular/core';

interface Colors {
  border: string;
  text: string;
}

@Component({
  selector: 'app-custom-tag',
  imports: [],
  templateUrl: './custom-tag.component.html'
})
export class CustomTagComponent {
  @Input() statusId: string | number = '';
  @Input() statusName = '';

  getColors: Colors = {
    '': { border: '#1689CA', text: '#1689CA' },
    '0': { border: '#1689CA', text: '#1689CA' },
    '1': { border: '#1689CA', text: '#1689CA' },
    '2': { border: '#7C9CB9', text: '#173F6F' },
    '3': { border: '#A8CEAB', text: '#7CB580' },
    '4': { border: '#79D9FF', text: '#1689CA' },
    '5': { border: '#E69F00', text: '#F58220' },
    '6': { border: '#7CB580', text: '#358540' },
    '7': { border: '#F16937', text: '#CF0808' },
    '8': { border: '#777C83', text: '#4C5158' }
  };
}
