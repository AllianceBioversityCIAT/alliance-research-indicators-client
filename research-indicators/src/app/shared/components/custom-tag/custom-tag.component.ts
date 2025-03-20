import { Component, Input, OnInit } from '@angular/core';

type Colors = Record<string, { border: string; text: string }>;

@Component({
  selector: 'app-custom-tag',
  imports: [],
  templateUrl: './custom-tag.component.html'
})
export class CustomTagComponent implements OnInit {
  @Input() statusId: string | number = '';
  @Input() statusName = '';

  getColors: Colors = {
    '': { border: '#79D9FF', text: '#1689CA' },
    '0': { border: '#79D9FF', text: '#1689CA' },
    '1': { border: '#79D9FF', text: '#1689CA' },
    '2': { border: '#7C9CB9', text: '#173F6F' },
    '3': { border: '#A8CEAB', text: '#7CB580' },
    '4': { border: '#F5C76E', text: '#F5C76E' },
    '5': { border: '#F5C76E', text: '#F5C76E' },
    '6': { border: '#F5C76E', text: '#F5C76E' },
    '7': { border: '#F5C76E', text: '#F5C76E' },
    '8': { border: '#F5C76E', text: '#F5C76E' }
  };

  ngOnInit() {
    console.log(this.statusId);
  }
}
