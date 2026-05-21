import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { WhatsNewService } from '../../services/whats-new.service';
import { ReleaseNoteCardComponent } from './components/release-note-card/release-note-card.component';

@Component({
  selector: 'app-whats-new-home',
  imports: [SkeletonModule, ReleaseNoteCardComponent],
  templateUrl: './whats-new-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class WhatsNewHomeComponent {
  whatsNewService = inject(WhatsNewService);
}
