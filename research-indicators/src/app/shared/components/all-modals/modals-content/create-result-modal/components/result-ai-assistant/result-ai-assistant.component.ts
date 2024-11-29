import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-result-ai-assistant',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './result-ai-assistant.component.html',
  styleUrl: './result-ai-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultAiAssistantComponent {
  createResultManagementService = inject(CreateResultManagementService);
}
