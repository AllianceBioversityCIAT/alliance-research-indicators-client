import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-copy-token',
  standalone: true,
  imports: [],
  templateUrl: './copy-token.component.html'
})
export class CopyTokenComponent {
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 't') {
      this.copyDataToClipboard();
    } else if (event.ctrlKey && event.key === 'p') {
      this.pasteDataFromClipboard();
    }
  }

  copyDataToClipboard() {
    const data = localStorage.getItem('data');
    if (data) {
      navigator.clipboard.writeText(data);
    } else {
      console.warn('No data found in local storage');
    }
  }

  pasteDataFromClipboard() {
    navigator.clipboard
      .readText()
      .then(text => {
        localStorage.setItem('data', text);
      })
      .catch(err => {
        console.error('Could not read text from clipboard: ', err);
      });
  }
}
