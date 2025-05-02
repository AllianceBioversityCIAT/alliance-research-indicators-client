import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CacheService } from 'src/app/shared/services/cache/cache.service';

@Component({
  selector: 'app-ask-for-help-modal',
  imports: [FormsModule, SelectModule, InputTextModule, ButtonModule, TextareaModule],
  templateUrl: './ask-for-help-modal.component.html',
  styleUrl: './ask-for-help-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AskForHelpModalComponent {
  body = signal<{
    type: string | null;
    message: string | null;
  }>({
    type: null,
    message: null
  });

  loading = signal(false);
  supportTypes = [
    {
      title: 'Technical Support – For issues related to platform functionality, errors, or performance problems.',
      value: 'technical-support'
    },
    {
      title: 'Content Support – For questions or guidance on how to input or report results information in STAR.',
      value: 'content-support'
    }
  ];

  cache = inject(CacheService);

  validateForm() {
    const { type, message } = this.body();
    return type && message && message.length >= 50;
  }

  sendRequest() {
    const sendData = {
      type: this.body().type,
      message: this.body().message,
      url: this.cache.currentUrlPath(),
      metadata: this.cache.currentMetadata(),
      userData: this.cache.dataCache().user,
      currentSectionHeaderName: this.cache.currentSectionHeaderName(),
      currentResultId: this.cache.currentResultId(),
      currentRouteTitle: this.cache.currentRouteTitle(),
      windowWidth: this.cache.windowWidth(),
      windowHeight: this.cache.windowHeight()
    };

    console.log(sendData);
  }
}
