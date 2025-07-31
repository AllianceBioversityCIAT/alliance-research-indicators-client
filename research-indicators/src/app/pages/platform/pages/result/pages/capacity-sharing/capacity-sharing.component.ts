import { Component, computed, inject, effect, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RadioButtonComponent } from '../../../../../../shared/components/custom-fields/radio-button/radio-button.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { SelectComponent } from '../../../../../../shared/components/custom-fields/select/select.component';
import { GetCapSharing } from '../../../../../../shared/interfaces/get-cap-sharing.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { CalendarInputComponent } from '../../../../../../shared/components/custom-fields/calendar-input/calendar-input.component';
import { PartnerSelectedItemComponent } from '../../../../../../shared/components/partner-selected-item/partner-selected-item.component';
import { SubmissionService } from '@shared/services/submission.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';

@Component({
  selector: 'app-capacity-sharing',
  imports: [
    FormsModule,
    NavigationButtonsComponent,
    DropdownModule,
    FormHeaderComponent,
    CalendarModule,
    RadioButtonModule,
    RadioButtonComponent,
    SelectComponent,
    InputComponent,
    CalendarInputComponent,
    MultiselectComponent,
    PartnerSelectedItemComponent
  ],
  templateUrl: './capacity-sharing.component.html',
  styleUrl: './capacity-sharing.component.scss'
})
export default class CapacitySharingComponent {
  api = inject(ApiService);
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);
  body: WritableSignal<GetCapSharing> = signal({});
  submission = inject(SubmissionService);
  loading = signal(false);
  allModalsService = inject(AllModalsService);
  versionWatcher = inject(VersionWatcherService);
  route = inject(ActivatedRoute);

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });

    effect(() => {
      if (!this.isLongTermSelected()) {
        const current = this.body();
        if (current?.degree_id) {
          this.body.update(b => ({
            ...b,
            degree_id: undefined
          }));
        }
      }
    });
  }

  isLongTermSelected = computed(() => this.body()?.session_length_id === 2);

  canRemove = (): boolean => {
    return this.submission.isEditableStatus();
  };

  isStartDateGreaterThanEndDate = computed(() => {
    const { start_date, end_date } = this.body() ?? {};
    if (!start_date || !end_date) return false;
    return new Date(start_date).getTime() > new Date(end_date).getTime();
  });

  async getData() {
    this.cache.loadingCurrentResult.set(true);
    const response = await this.api.GET_CapacitySharing();
    const data = {
      ...response.data,
      start_date: typeof response.data.start_date === 'string' ? this.parseToLocalDate(response.data.start_date) : undefined,
      end_date: typeof response.data.end_date === 'string' ? this.parseToLocalDate(response.data.end_date) : undefined
    };

    this.body.set(data);
    this.cache.loadingCurrentResult.set(false);
    this.body.update(current => {
      if (current.start_date) current.start_date = new Date(current.start_date ?? '');
      if (current.end_date) current.end_date = new Date(current.end_date ?? '');
      return { ...current };
    });
    this.loading.set(false);
  }

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);

    const resultId = this.cache.currentResultId().toString();
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;

    const navigateTo = (path: string) => {
      this.router.navigate(['result', resultId, path], {
        queryParams,
        replaceUrl: true
      });
    };

    if (this.submission.isEditableStatus()) {
      this.body.update(current => {
        if (current.start_date) {
          current.start_date = new Date(current.start_date).toISOString();
        }
        if (current.end_date) {
          current.end_date = new Date(current.end_date).toISOString();
        }
        return { ...current };
      });

      await this.api.PATCH_CapacitySharing(this.body());

      this.actions.showToast({
        severity: 'success',
        summary: 'CapSharing Details',
        detail: 'Data saved successfully'
      });

      await this.getData();
    }

    if (page === 'next') navigateTo('partners');
    if (page === 'back') navigateTo('alliance-alignment');

    this.loading.set(false);
  }

  setSectionAndOpenModal(section: string) {
    this.allModalsService.setPartnerRequestSection(section);
    this.allModalsService.openModal('requestPartner');
  }

  parseToLocalDate(dateStr: string): Date {
    const date = new Date(dateStr);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }
}
