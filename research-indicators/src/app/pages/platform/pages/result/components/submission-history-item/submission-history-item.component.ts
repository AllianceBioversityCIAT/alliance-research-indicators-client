import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Input, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { SubmissionHistoryItem } from '@shared/interfaces/submission-history-item.interface';
import { RolesService } from '@shared/services/cache/roles.service';
import { formatUtcToCet } from '@shared/utils/date-cet.util';

const OICR_INDICATOR_ID = 5;

@Component({
  selector: 'app-submission-history-item',
  standalone: true,
  imports: [DatePipe, CustomTagComponent, CalendarModule, FormsModule],
  templateUrl: './submission-history-item.component.html',
  styleUrl: './submission-history-item.component.scss'
})
export class SubmissionHistoryItemComponent implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly submissionService = inject(SubmissionService);
  private readonly actions = inject(ActionsService);
  readonly rolesService = inject(RolesService);

  @Input() historyItem: SubmissionHistoryItem = new SubmissionHistoryItem();

  showEditModal = signal(false);

  private readonly scrollCloseHandler = (): void => {
    if (this.cache.editStatusDateOpenId() === this.submissionHistoryId()) {
      this.closeEditModal();
    }
  };
  editDate = signal<Date | null>(null);
  editTime = signal<Date | null>(null);
  saving = signal(false);
  panelStyle = signal<{ top: string; left: string } | null>(null);

  isOicr = computed(() => this.cache.currentMetadata()?.indicator_id === OICR_INDICATOR_ID);

  submissionHistoryId = computed(() => {
    const item = this.historyItem as SubmissionHistoryItem & { id?: number };
    return this.historyItem.submission_history_id ?? item.id;
  });

  canEditTimestamp = computed(() => {
    if (!this.isOicr()) return false;
    if (this.historyItem.editable_timestamp === false) return false;
    return !!this.submissionHistoryId();
  });

  updatedAtCetFormatted = computed(() => formatUtcToCet(this.historyItem.updated_at));

  customDateCetFormatted = computed(() => formatUtcToCet(this.historyItem.custom_date));

  isEditPanelVisible = computed(
    () => this.showEditModal() && this.panelStyle() != null && this.cache.editStatusDateOpenId() === this.submissionHistoryId()
  );

  private readonly closeWhenOtherOpens = effect(() => {
    const openId = this.cache.editStatusDateOpenId();
    const myId = this.submissionHistoryId();
    if (openId != null && myId != null && openId !== myId) {
      this.showEditModal.set(false);
      this.panelStyle.set(null);
    }
  });

  openEditModal(ev?: Event): void {
    const id = this.submissionHistoryId();
    if (id == null) return;
    this.cache.editStatusDateOpenId.set(id);
    const raw = this.historyItem.updated_at ? new Date(this.historyItem.updated_at) : new Date();
    this.editDate.set(new Date(raw.getFullYear(), raw.getMonth(), raw.getDate()));
    this.editTime.set(new Date(0, 0, 0, raw.getHours(), raw.getMinutes()));
    const btn = ev?.currentTarget as HTMLElement | undefined;
    const rect = btn?.getBoundingClientRect();
    if (rect) {
      const offsetPx = 130;
      this.panelStyle.set({
        top: `${rect.bottom + 4}px`,
        left: `${Math.max(0, rect.left - offsetPx)}px`
      });
    } else {
      this.panelStyle.set(null);
    }
    this.showEditModal.set(true);
    window.addEventListener('scroll', this.scrollCloseHandler, true);
  }

  closeEditModal(): void {
    window.removeEventListener('scroll', this.scrollCloseHandler, true);
    this.showEditModal.set(false);
    this.panelStyle.set(null);
    this.cache.editStatusDateOpenId.set(null);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollCloseHandler, true);
  }

  async confirmEdit(): Promise<void> {
    const date = this.editDate();
    const time = this.editTime();
    const id = this.submissionHistoryId();
    const resultCode = this.cache.getCurrentNumericResultId();
    if (!date || !time || !id || resultCode == null) return;
    this.saving.set(true);
    try {
      const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), 0);
      await this.api.PATCH_StatusChangeDate(resultCode, id, combined.toISOString());
      this.actions.showToast({
        severity: 'success',
        summary: 'Date updated',
        detail: 'Status change date has been updated.'
      });
      this.submissionService.refreshSubmissionHistory.update(v => v + 1);
      this.closeEditModal();
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'errorDetail' in err
          ? (err as { errorDetail?: { errors?: string } }).errorDetail?.errors
          : 'Failed to update date.';
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: String(detail) });
    } finally {
      this.saving.set(false);
    }
  }
}
