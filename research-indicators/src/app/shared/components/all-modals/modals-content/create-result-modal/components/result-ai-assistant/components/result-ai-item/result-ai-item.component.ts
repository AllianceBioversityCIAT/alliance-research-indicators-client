import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal, ViewChild, ElementRef, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { AIAssistantResult } from '../../../../models/AIAssistantResult';
import { CreateResultManagementService } from '../../../../services/create-result-management.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '@shared/services/api.service';
import { Router } from '@angular/router';
import { ActionsService } from '@shared/services/actions.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { FormsModule } from '@angular/forms';
import { GetOsResult } from '@shared/interfaces/get-os-result.interface';
import { EXPANDED_ITEM_DETAILS, getIndicatorTypeIcon, INDICATOR_TYPE_ICONS } from '@shared/constants/result-ai.constants';

@Component({
  selector: 'app-result-ai-item',
  templateUrl: './result-ai-item.component.html',
  styleUrl: './result-ai-item.component.scss',
  imports: [CommonModule, ButtonModule, TooltipModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultAiItemComponent {
  @Input() item!: AIAssistantResult | GetOsResult;
  @Input() hideButtons = false;
  @Input() isLastItem = false;
  @Input() isFirstItem = false;
  @ViewChild('titleInput') titleInput!: ElementRef;
  @ViewChild('titleText') titleText!: ElementRef;
  @ViewChild('editTitleContainer') editTitleContainer!: ElementRef;
  createResultManagementService = inject(CreateResultManagementService);
  createdResults = signal<Set<string>>(new Set());
  api = inject(ApiService);
  isCreated = signal(false);
  actions = inject(ActionsService);
  allModalsService = inject(AllModalsService);
  isEditingTitle = signal(false);
  private _tempTitle = '';

  get tempTitle(): string {
    return this._tempTitle;
  }

  set tempTitle(value: string) {
    this._tempTitle = value;
    this.autoGrow();
  }

  expandedItemDetails = EXPANDED_ITEM_DETAILS;
  indicatorTypeIcon = INDICATOR_TYPE_ICONS;

  constructor(private readonly router: Router) {}

  getIndicatorTypeIcon(type: string) {
    return getIndicatorTypeIcon(type);
  }

  toggleExpand(item: AIAssistantResult) {
    this.createResultManagementService.expandedItem.set(this.createResultManagementService.expandedItem() === item ? null : item);
  }

  discardResult(item: AIAssistantResult) {
    this.createResultManagementService.items.update(items => items.filter(i => i !== item));
  }

  createResult(item: AIAssistantResult) {
    if (this.isEditingTitle()) {
      this.finishEditingTitle();
    }
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

  isAIAssistantResult(item: AIAssistantResult | GetOsResult): item is AIAssistantResult {
    return 'training_type' in item;
  }

  autoGrow() {
    if (this.titleInput?.nativeElement) {
      this.titleInput.nativeElement.style.height = 'auto';
      this.titleInput.nativeElement.style.height = this.titleInput.nativeElement.scrollHeight + 'px';
    }
  }

  startEditingTitle() {
    this._tempTitle = this.item.title;
    this.isEditingTitle.set(true);
    setTimeout(() => {
      this.autoGrow();
      this.titleInput?.nativeElement?.focus();
    });
  }

  finishEditingTitle() {
    this.item.title = this._tempTitle;
    this.isEditingTitle.set(false);
  }

  cancelEditingTitle() {
    this.isEditingTitle.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.isEditingTitle()) {
      return;
    }

    const editContainer = this.editTitleContainer?.nativeElement;
    if (editContainer && !editContainer.contains(event.target as Node)) {
      this.finishEditingTitle();
    }
  }
}
