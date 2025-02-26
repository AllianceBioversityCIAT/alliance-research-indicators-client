import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { environment } from '@envs/environment';
import { CacheService } from '@services/cache/cache.service';
import { MetadataPanelComponent } from '@components/metadata-panel/metadata-panel.component';
import { WebsocketService } from '@sockets/websocket.service';
import { ActionsService } from './shared/services/actions.service';
import { GlobalAlertComponent } from './shared/components/global-alert/global-alert.component';
import { GlobalToastComponent } from './shared/components/global-toast/global-toast.component';
import { CopyTokenComponent } from './shared/components/copy-token/copy-token.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MetadataPanelComponent, GlobalAlertComponent, GlobalToastComponent, CopyTokenComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  cache = inject(CacheService);
  sockets = inject(WebsocketService);
  actions = inject(ActionsService);
  title = 'research-indicators';
  name = environment.name;
  route = inject(ActivatedRoute);
}
