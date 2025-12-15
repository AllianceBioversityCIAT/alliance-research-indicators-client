import { Component, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { STATUS_COLOR_MAP } from '@shared/constants/status-colors';
import { CommonModule } from '@angular/common';

interface StatusOption {
  id: number;
  name: string;
  direction: 'previous' | 'next';
  icon?: 'reject' | 'postpone';
}

@Component({
  selector: 'app-status-dropdown',
  imports: [CommonModule],
  templateUrl: './status-dropdown.component.html'
})
export class StatusDropdownComponent {
  @Input() statusId = 0;
  @Input() statusName = '';
  @Output() statusChange = new EventEmitter<number>();

  isOpen = signal(false);

  // Status sequence: Draft (4) -> Science Edition (12) -> KM Curation (13) -> Published (14)
  private readonly STATUS_SEQUENCE = [
    { id: 4, name: 'Draft' },
    { id: 12, name: 'Science Edition' },
    { id: 13, name: 'KM Curation' },
    { id: 14, name: 'Published' }
  ];

  private readonly SPECIAL_TRANSITIONS: Record<number, StatusOption[]> = {
    4: [
      { id: 11, name: 'Postpone', direction: 'previous', icon: 'postpone' },
      { id: 7, name: 'Do not approve', direction: 'previous', icon: 'reject' },
    ]
  };

  getColors() {
    const status = String(this.statusId);
    return STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP[''];
  }

  getAvailableStatuses(): StatusOption[] {
    const currentIndex = this.STATUS_SEQUENCE.findIndex(s => s.id === this.statusId);
    if (currentIndex === -1) return [];

    const options: StatusOption[] = [];

    // Add previous status if exists (all statuses except Draft can go back)
    if (currentIndex > 0) {
      const previousStatus = this.STATUS_SEQUENCE[currentIndex - 1];
      options.push({
        id: previousStatus.id,
        name: previousStatus.name,
        direction: 'previous'
      });
    }

    // Add next status if exists
    if (currentIndex < this.STATUS_SEQUENCE.length - 1) {
      const nextStatus = this.STATUS_SEQUENCE[currentIndex + 1];
      options.push({
        id: nextStatus.id,
        name: nextStatus.name,
        direction: 'next'
      });
    }

    const specialTransitions = this.SPECIAL_TRANSITIONS[this.statusId] || [];
    options.push(...specialTransitions);

    return options;
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

