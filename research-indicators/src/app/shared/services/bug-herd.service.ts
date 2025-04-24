import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BugHerdService {
  private readonly bugHerdScriptId = 'bugherd-script';
  private readonly bugHerdApiKey = 'xjszm5izs5xh4u3vdnwqna';

  constructor() {
    if (!environment.production) {
      this.loadBugHerdScript();
    }
  }

  private loadBugHerdScript(): void {
    if (document.getElementById(this.bugHerdScriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = this.bugHerdScriptId;
    script.type = 'text/javascript';
    script.src = `https://www.bugherd.com/sidebarv2.js?apikey=${this.bugHerdApiKey}`;
    script.async = true;
    document.body.appendChild(script);
  }
}
