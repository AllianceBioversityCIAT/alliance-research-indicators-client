import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '@envs/environment';
import { CacheService } from '@services/cache/cache.service';
import { MetadataPanelComponent } from '@components/metadata-panel/metadata-panel.component';
import { WebsocketService } from '@sockets/websocket.service';
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
export class AppComponent {
  cache = inject(CacheService);
  sockets = inject(WebsocketService);
  openReplay = inject(OpenReplayService);
  googleAnalytics = inject(GoogleAnalyticsService);
  actions = inject(ActionsService);
  title = 'research-indicators';
  name = environment.name;
}
