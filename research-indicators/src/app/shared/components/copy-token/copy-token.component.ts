import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-copy-token',
  standalone: true,
  imports: [],
  templateUrl: './copy-token.component.html'
})
export class CopyTokenComponent {
  private isMacOS: boolean = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 't') {
      this.copyDataToClipboard();
    } else if (event.ctrlKey && event.key === 'p') {
      this.pasteDataFromClipboard();
    } else if (this.isMacOS && event.metaKey && event.key === 'k') {
      this.focusSearchInput();
    } else if (this.isMacOS && event.ctrlKey && event.altKey && event.key === 'c') {
      // this.clearLocalStorageAndReload();
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
        window.location.reload();
      })
      .catch(err => {
        console.error('Could not read text from clipboard: ', err);
      });
  }

  focusSearchInput() {
    const searchInput = document.getElementById('search-result-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.click();
    } else {
      console.warn('Search input not found');
    }
  }

  clearLocalStorageAndReload() {
    localStorage.clear();
    window.location.reload();
  }
}
