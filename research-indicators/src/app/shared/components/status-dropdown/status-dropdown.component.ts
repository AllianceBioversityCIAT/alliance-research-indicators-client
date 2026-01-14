import { Component, Input, Output, EventEmitter, signal, HostListener, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CacheService } from '@shared/services/cache/cache.service';
import { ApiService } from '@shared/services/api.service';
import { NextStepOption, GetNextStep } from '@shared/interfaces/get-next-step.interface';

@Component({
  selector: 'app-status-dropdown',
  imports: [CommonModule],
  templateUrl: './status-dropdown.component.html'
})
export class StatusDropdownComponent implements OnInit, OnChanges {
  @Input() statusId = 0;
  @Input() statusName = '';
  @Output() statusChange = new EventEmitter<number>();
  cache = inject(CacheService);
  api = inject(ApiService);
  isOpen = signal(false);
  
  availableStatuses = signal<NextStepOption[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadNextSteps();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['statusId'] && !changes['statusId'].firstChange) {
      this.loadNextSteps();
    }
  }

  async loadNextSteps(): Promise<void> {
    if (!this.statusId) {
      this.availableStatuses.set([]);
      return;
    }

    const resultCode = this.cache.getCurrentNumericResultId();
    if (!resultCode) {
      this.availableStatuses.set([]);
      return;
    }

    this.isLoading.set(true);
    try {
      const platformCode = this.cache.getCurrentPlatformCode();
      const response = await this.api.GET_NextStep(
        resultCode,
        platformCode || undefined
      );
      
      if (response.successfulRequest && response.data) {
        if (Array.isArray(response.data)) {
          this.availableStatuses.set(response.data.map(item => ({
            id: item.result_status_id || item.id,
            name: item.name,
            direction: item.direction,
            icon: item.icon
          })));
        } else if (response.data.available_statuses) {
          this.availableStatuses.set(response.data.available_statuses);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.availableStatuses.set(response.data.data.map(item => ({
            id: item.result_status_id || item.id,
            name: item.name,
            direction: item.direction,
            icon: item.icon
          })));
        } else {
          const options = this.buildOptionsFromResponse(response.data);
          this.availableStatuses.set(options);
        }
      } else {
        this.availableStatuses.set([]);
      }
    } catch (error) {
      console.error('Error loading next steps:', error);
      this.availableStatuses.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildOptionsFromResponse(data: GetNextStep): NextStepOption[] {
    const options: NextStepOption[] = [];
    
    if (data.sequence && Array.isArray(data.sequence)) {
      const currentIndex = data.sequence.findIndex((s) => s.id === this.statusId);
      
      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          const previousStatus = data.sequence[currentIndex - 1];
          options.push({
            id: previousStatus.id,
            name: previousStatus.name,
            direction: 'previous'
          });
        }

        if (currentIndex < data.sequence.length - 1) {
          const nextStatus = data.sequence[currentIndex + 1];
          options.push({
            id: nextStatus.id,
            name: nextStatus.name,
            direction: 'next'
          });
        }
      }
    }

    if (data.special_transitions?.[this.statusId]) {
      options.push(...data.special_transitions[this.statusId]);
    }

    return options;
  }

  getAvailableStatuses(): NextStepOption[] {
    return this.availableStatuses();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  selectStatus(statusId: number, event: Event) {
    event.stopPropagation();
    this.statusChange.emit(statusId);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.status-dropdown-container')) {
      this.isOpen.set(false);
    }
  }
}

