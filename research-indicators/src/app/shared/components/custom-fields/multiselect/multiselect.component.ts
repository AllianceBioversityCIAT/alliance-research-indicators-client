/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  effect,
  inject,
  Input,
  PLATFORM_ID,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal,
  OnInit,
  OnChanges,
  SimpleChanges,
  output,
  ElementRef,
  NgZone
} from '@angular/core';
import { MultiSelectModule, MultiSelect } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { ActionsService } from '../../../services/actions.service';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { ControlListServices } from '../../../interfaces/services.interface';
import { CacheService } from '../../../services/cache/cache.service';
import { SkeletonModule } from 'primeng/skeleton';
import { UtilsService } from '../../../services/utils.service';
import { environment } from '../../../../../environments/environment';
import { TooltipModule } from 'primeng/tooltip';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, NgTemplateOutlet, SkeletonModule, TooltipModule],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiselectComponent implements OnInit, OnChanges {
  currentResultIsLoading = inject(CacheService).currentResultIsLoading;
  utils = inject(UtilsService);
  actions = inject(ActionsService);
  serviceLocator = inject(ServiceLocatorService);
  allModalsService = inject(AllModalsService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  @ViewChild(MultiSelect) private primeMultiSelect?: MultiSelect;

  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('selectedItems') selectedItems!: TemplateRef<any>;
  @ContentChild('item') item!: TemplateRef<any>;

  @Input() signal: WritableSignal<any> = signal({});
  @Input() optionLabel = '';
  /** When set (e.g. second field name), uses 60px min row height like app-select — pairs with p-scroller autoSize for wrapping labels. */
  @Input() optionLabel2 = '';
  @Input() optionValue = '';
  @Input() signalOptionValue = '';
  @Input() serviceName: ControlListServices = '';
  @Input() label = '';
  @Input() description = '';
  @Input() hideSelected = false;
  @Input() hideTemplate = false;
  @Input() disabledSelectedScroll = false;
  @Input() flagAttributes: { isoAlpha2: string; institution_location_name: string } = { isoAlpha2: '', institution_location_name: '' };
  @Input() removeCondition: (item: any) => boolean = () => true;
  @Input() removeTooltip = '';
  @Input() disabled = false;
  @Input() filterBy = '';
  @Input() optionsDisabled: WritableSignal<any[]> = signal([]);
  @Input() set isRequired(value: boolean) {
    this._isRequired.set(value);
  }
  _isRequired = signal(false);
  @Input() helperText = '';
  @Input() textSpan = '';
  @Input() columnsOnXl = false;
  @Input() placeholder = '';
  @Input() serviceParams: unknown;

  @Input() scrollHeight = '268px';
  @Input() itemHeight = 41;
  @Input() enableVirtualScroll = true;
  @Input() appendTo: 'body' | 'self' = 'body';

  get multiselectPanelStyle(): { width: string; minWidth: string } | null {
    return this.appendTo === 'self' ? { width: '100%', minWidth: '100%' } : null;
  }
  @Input() dark = false;
  @Input() optionFilter: (item: any) => boolean = () => true;
  @Input() hideRemoveIcon = false;
  @Input() selectedItemsSurfaceColor = '';
  selectEvent = output<any>();
  environment = environment;

  service: any;
  private inFlightLoadByKey = new Map<string, Promise<void>>();
  optionsSig: WritableSignal<any[]> = signal<any[]>([]);
  loadingSig: WritableSignal<boolean> = signal<boolean>(false);

  body: WritableSignal<any> = signal({ value: null });

  useDisabled = computed(() => this.optionsDisabled()?.length);

  listWithDisabled = computed(() => {
    const items = this.optionsSig() ?? [];
    return items.map((item: any) => ({
      ...item,
      disabled: this.optionsDisabled().find((option: any) => option[this.optionValue] === item[this.optionValue])
    }));
  });

  availableOptions = computed(() => {
    const base = this.useDisabled() ? this.listWithDisabled() : this.optionsSig();
    const normalized = Array.isArray(base) ? base : [];
    const filtered = normalized.filter(option => {
      try {
        return this.optionFilter ? this.optionFilter(option) : true;
      } catch {
        return true;
      }
    });

    const selected = this.selectedOptions();
    const missingSelected = selected.filter((item: any) => {
      return !filtered.some((option: any) => option[this.optionValue] === item[this.optionValue]);
    });

    return [...filtered, ...missingSelected];
  });

  isInvalid = computed(() => {
    return this._isRequired() && (!this.selectedOptions() || this.selectedOptions()?.length === 0);
  });

  selectedOptions = computed(() => {
    const items = this.utils.getNestedProperty(this.signal(), this.signalOptionValue);
    const normalized = Array.isArray(items) ? items : [];
    return normalized.map((item: any) => ({
      ...item,
      disabled: Boolean(this.optionsDisabled().some((option: any) => option[this.optionValue] === item[this.optionValue]))
    }));
  });
  firstLoad = signal(true);

  onChange = effect(
    () => {
      const hasNoLabelList = this.utils
        .getNestedProperty(this.signal(), this.signalOptionValue)
        ?.filter((item: any) => !Object.hasOwn(item, this.optionLabel));
      if (!this.currentResultIsLoading() && this.optionsSig()?.length && this.firstLoad() && hasNoLabelList?.length) {
        this.signal.update((current: any) => {
          this.utils.setNestedPropertyWithReduce(
            current,
            this.signalOptionValue,
            this.utils.getNestedProperty(current, this.signalOptionValue)?.map((item: any) => {
              const itemFound = this.optionsSig()?.find((option: any) => option[this.optionValue] === item[this.optionValue]);
              return { ...item, ...itemFound };
            })
          );
          return {
            ...current
          };
        });
        this.setBodyFromSignal();
        this.firstLoad.set(false);
        /* istanbul ignore next */
      } else if (
        this.utils.getNestedProperty(this.signal(), this.signalOptionValue)?.length &&
        !this.currentResultIsLoading() &&
        this.optionsSig()?.length &&
        this.firstLoad()
      ) {
        /* istanbul ignore next */
        this.setBodyFromSignal();
      }
    },
    { allowSignalWrites: true }
  );

  onGlobalLoadingChange = effect(
    () => {
      if (this.currentResultIsLoading()) {
        this.firstLoad.set(true);
      }
    },
    { allowSignalWrites: true }
  );

  syncBodyWithSignal = effect(
    () => {
      const signalValue = this.utils.getNestedProperty(this.signal(), this.signalOptionValue);

      if (Array.isArray(signalValue) && signalValue.length > 0) {
        const bodyValue = signalValue.map((item: any) => item[this.optionValue]);
        const currentBodyValue = this.body().value;
        const currentArray = Array.isArray(currentBodyValue) ? currentBodyValue : [];

        if (currentArray.length !== bodyValue.length || !currentArray.every((val, idx) => val === bodyValue[idx])) {
          this.body.set({ value: bodyValue });
        }
      } else {
        const currentBodyValue = this.body().value;
        if (currentBodyValue !== null && currentBodyValue !== undefined) {
          this.body.set({ value: null });
        }
      }
    },
    { allowSignalWrites: true }
  );

  ngOnInit(): void {
    this.service = this.serviceLocator.getService(this.serviceName);
    this.bindServiceSignals();
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceName'] || changes['serviceParams']) {
      this.service = this.serviceLocator.getService(this.serviceName);
      this.bindServiceSignals();
      this.loadData();
    }
  }

  private bindServiceSignals() {
    if (this.service?.getList && this.service?.getLoading) {
      const listSig = this.service.getList(this.serviceParams as any);
      const loadingSig = this.service.getLoading(this.serviceParams as any);
      if (listSig) this.optionsSig = listSig;
      if (loadingSig) this.loadingSig = loadingSig;
    } else {
      if (this.service?.list) this.optionsSig = this.service.list;
      if (this.service?.loading) this.loadingSig = this.service.loading;
    }
  }

  virtualScrollEstimateSize(): number {
    return this.optionLabel2 ? 60 : this.itemHeight;
  }

  trackSelectedOptionRow(index: number, row: unknown): string | number {
    return this.optionRowTrackKeyFromRow(row) ?? index;
  }

  private optionRowTrackKeyFromRow(row: unknown): string | number | undefined {
    if (!this.optionValue || row === null || row === undefined || typeof row !== 'object') return undefined;
    const raw = (row as Record<string, unknown>)[this.optionValue];
    if (raw === undefined || raw === null || raw === '') return undefined;
    const t = typeof raw;
    if (t === 'number' || t === 'string') return raw as number | string;
    if (t === 'boolean') return raw ? 'true' : 'false';
    if (t === 'bigint') return (raw as bigint).toString();
    return undefined;
  }

  private loadKey(): string {
    return `${String(this.serviceName)}::${JSON.stringify(this.serviceParams)}`;
  }

  private async loadData() {
    if (!this.service || typeof this.service.main !== 'function') {
      return;
    }
    const key = this.loadKey();
    let run = this.inFlightLoadByKey.get(key);
    if (!run) {
      run = (async () => {
        try {
          await this.service.main(this.serviceParams as any);
        } catch {
          // ignore
        } finally {
          this.inFlightLoadByKey.delete(key);
        }
      })();
      this.inFlightLoadByKey.set(key, run);
    }
    await run;
  }

  onFilter(event: any) {
    if (this.service?.isOpenSearch()) this.service.update(event.filter);
  }

  clear() {
    this.signal.update(prev => ({
      ...prev,
      [this.signalOptionValue]: []
    }));
    this.body.set({ value: null });
  }

  setValue(event: number[]) {
    this.body.set({ value: event });

    this.signal.update((current: any) => {
      const attr = this.optionValue;
      const prevItems = this.utils.getNestedProperty(current, this.signalOptionValue) ?? [];
      const eventIds = Array.isArray(event) ? event : [];
      const optionsList = this.optionsSig() ?? [];

      const nextItems = eventIds.map((id: number) => {
        const fromPrev = prevItems.find((item: any) => item[attr] == id);
        const fromOptions = optionsList.find((option: any) => option[attr] == id);
        const merged: Record<string, unknown> = { ...(fromPrev ?? {}), ...(fromOptions ?? {}) };
        if (merged[attr] == null) {
          merged[attr] = id;
        }
        return merged as any;
      });

      this.utils.setNestedPropertyWithReduce(current, this.signalOptionValue, nextItems);

      this.selectEvent.emit(current);
      return { ...current };
    });
  }

  objectArrayToIdArray(array: any[], attribute: string) {
    return array?.map((item: any) => item[attribute]);
  }

  setBodyFromSignal(): void {
    this.body.set({
      value: this.utils.getNestedProperty(this.signal(), this.signalOptionValue)?.map((item: any) => item[this.optionValue])
    });
  }

  removeOption(option: any) {
    this.signal.update((current: any) => {
      const updatedOptions = this.utils
        .getNestedProperty(current, this.signalOptionValue)
        .filter((item: any) => item[this.optionValue] !== option[this.optionValue]);

      this.body.set({ value: this.objectArrayToIdArray(updatedOptions, this.optionValue) });

      this.utils.setNestedPropertyWithReduce(current, this.signalOptionValue, updatedOptions);
      this.selectEvent.emit({ ...current });
      return { ...current };
    });
  }

  onMultiselectPanelShow(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => this.applyMultiselectPanelMaxWidth());
    });
  }

  onMultiselectPanelHide(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.clearMultiselectPanelMaxWidth();
  }

  private applyMultiselectPanelMaxWidth(): void {
    const overlay = this.primeMultiSelect?.overlayViewChild;
    const root = overlay?.overlayEl;
    if (!root) {
      return;
    }
    const trigger = this.hostEl.nativeElement.querySelector('.p-multiselect');
    if (!trigger) {
      return;
    }
    const w = Math.max(0, Math.round(trigger.getBoundingClientRect().width));
    if (w < 1) {
      return;
    }
    const panel = root.querySelector('.p-multiselect-overlay') as HTMLElement | null;
    root.style.maxWidth = `${w}px`;
    root.style.boxSizing = 'border-box';
    if (panel) {
      panel.style.maxWidth = `${w}px`;
      panel.style.boxSizing = 'border-box';
    }
    overlay.alignOverlay();
  }

  private clearMultiselectPanelMaxWidth(): void {
    const overlay = this.primeMultiSelect?.overlayViewChild;
    const root = overlay?.overlayEl;
    if (!root) {
      return;
    }
    const panel = root.querySelector('.p-multiselect-overlay') as HTMLElement | null;
    root.style.removeProperty('max-width');
    root.style.removeProperty('box-sizing');
    if (panel) {
      panel.style.removeProperty('max-width');
      panel.style.removeProperty('box-sizing');
    }
  }

  removeById(id: string | number) {
    const option = this.service?.list()?.find((o: any) => o?.[this.optionValue] === id);
    if (option) this.removeOption(option);
  }
}
