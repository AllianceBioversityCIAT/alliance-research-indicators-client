import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { environment } from '@envs/environment';
import { CacheService } from '@services/cache/cache.service';
import { MetadataPanelComponent } from '@components/metadata-panel/metadata-panel.component';
import { WebsocketService } from '@sockets/websocket.service';
import { OpenReplayService } from './shared/services/open-replay.service';
import { GoogleAnalyticsService } from './shared/services/google-analytics.service';
import { ActionsService } from './shared/services/actions.service';
import { GlobalAlertComponent } from './shared/components/global-alert/global-alert.component';
import { GlobalToastComponent } from './shared/components/global-toast/global-toast.component';
import { CopyTokenComponent } from './shared/components/copy-token/copy-token.component';
import { ConnectionStatusComponent } from './shared/components/connection-status/connection-status.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MetadataPanelComponent, GlobalAlertComponent, GlobalToastComponent, CopyTokenComponent, ConnectionStatusComponent],
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
  route = inject(ActivatedRoute);
}
