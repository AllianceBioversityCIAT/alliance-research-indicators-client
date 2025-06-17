import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { AIAssistantResult } from '../../../../models/AIAssistantResult';
import { CreateResultManagementService } from '../../../../services/create-result-management.service';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '@shared/services/api.service';
import { Router } from '@angular/router';
import { ActionsService } from '@shared/services/actions.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { GetOsResult } from '@shared/interfaces/get-os-result.interface';
import { EXPANDED_ITEM_DETAILS, getIndicatorTypeIcon, INDICATOR_TYPE_ICONS } from '@shared/constants/result-ai.constants';

@Component({
  selector: 'app-result-ai-item',
  imports: [CommonModule, ButtonModule],
  templateUrl: './result-ai-item.component.html',
  styleUrl: './result-ai-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultAiItemComponent {
  @Input() item!: AIAssistantResult | GetOsResult;
  @Input() hideButtons = false;
  createResultManagementService = inject(CreateResultManagementService);
  createdResults = signal<Set<string>>(new Set());
  api = inject(ApiService);
  isCreated = signal(false);
  actions = inject(ActionsService);
  allModalsService = inject(AllModalsService);

  expandedItemDetails = EXPANDED_ITEM_DETAILS;
  indicatorTypeIcon = INDICATOR_TYPE_ICONS;

  constructor(private readonly router: Router) {}

  getIndicatorTypeIcon(type: string) {
    return getIndicatorTypeIcon(type);
  }

  isAIAssistantResult(item: AIAssistantResult | GetOsResult): item is AIAssistantResult {
    return 'training_type' in item;
  }

  toggleExpand(item: AIAssistantResult) {
    this.createResultManagementService.expandedItem.set(this.createResultManagementService.expandedItem() === item ? null : item);
  }

  discardResult(item: AIAssistantResult) {
    this.createResultManagementService.items.update(items => items.filter(i => i !== item));
  }

  createResult(item: AIAssistantResult) {
    this.api
      .POST_CreateResult({ ...item })
      .then(response => {
        if (!response.successfulRequest) {
          this.isCreated.set(false);
          this.actions.handleBadRequest(response);
        } else {
          this.isCreated.set(true);
          if ('data' in response && 'result_official_code' in response.data) {
            item.result_official_code = response.data.result_official_code as string;
          }
        }
      })
      .catch(err => {
        console.error('Error creating result:', err);
      });
  }

  openResult(item: AIAssistantResult) {
    const url = `/result/${item.result_official_code}/general-information`;
    window.open(url, '_blank');
  }
}
