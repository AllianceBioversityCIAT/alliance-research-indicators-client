import { Component, inject } from '@angular/core';

import { CreateResultFormComponent } from './components/create-result-form/create-result-form.component';
import { ResultAiAssistantComponent } from './components/result-ai-assistant/result-ai-assistant.component';
import { CreateResultManagementService } from './services/create-result-management.service';

@Component({
  selector: 'app-create-result-modal',
  standalone: true,
  imports: [CreateResultFormComponent, ResultAiAssistantComponent],
  templateUrl: './create-result-modal.component.html',
  styleUrl: './create-result-modal.component.scss'
})
export class CreateResultModalComponent {
  createResultManagementService = inject(CreateResultManagementService);
}
