import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-copy-token',
  standalone: true,
  imports: [],
  templateUrl: './copy-token.component.html',
  styleUrl: './copy-token.component.scss'
})
export class CopyTokenComponent {
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 't') {
      this.copyDataToClipboard();
    }
  }

  copyDataToClipboard() {
    const data = localStorage.getItem('data');
    if (data) {
      navigator.clipboard
        .writeText(data)
        .then(() => {
          console.log('Data copied to clipboard');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    } else {
      console.warn('No data found in local storage');
    }
  }
}
