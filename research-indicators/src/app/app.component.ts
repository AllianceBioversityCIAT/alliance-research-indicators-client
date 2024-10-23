import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { CacheService } from './shared/services/cache.service';
import { MetadataPanelComponent } from './shared/components/metadata-panel/metadata-panel.component';
import { WebsocketService } from './shared/sockets/websocket.service';
import { DynamicToastComponent } from './shared/components/dynamic-toast/dynamic-toast.component';
import { OpenReplayService } from './shared/services/open-replay.service';
import { GoogleAnalyticsService } from './shared/services/google-analytics.service';
import { ActionsService } from './shared/services/actions.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DynamicToastComponent, MetadataPanelComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  cache = inject(CacheService);
  sockets = inject(WebsocketService);
  openReplay = inject(OpenReplayService);
  googleAnalytics = inject(GoogleAnalyticsService);
  title = 'research-indicators';
  name = environment.name;
  ngOnInit(): void {
    inject(ActionsService).isTokenExpired();
  }
}
