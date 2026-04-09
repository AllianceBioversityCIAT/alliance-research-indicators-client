import { Component, computed, effect, ElementRef, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { GetContractsService } from '@services/control-list/get-contracts.service';
import { GetLeversService } from '@services/control-list/get-levers.service';
import { GetLevers } from '@shared/interfaces/get-levers.interface';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { GetAllianceAlignment } from '../../../../../../shared/interfaces/get-alliance-alignment.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../../../../environments/environment';
import { SubmissionService } from '@shared/services/submission.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { TooltipModule } from 'primeng/tooltip';
import { getContractStatusClasses } from '@shared/constants/status-classes.constants';
import { Lever, LeverStrategicOutcome } from '@shared/interfaces/oicr-creation.interface';
import { GetSdgs } from '@shared/interfaces/get-sdgs.interface';
import { AllianceLeverCardComponent } from './components/alliance-lever-card/alliance-lever-card.component';

@Component({
  selector: 'app-alliance-alignment',
  imports: [
    MultiSelectModule,
    FormHeaderComponent,
    FormsModule,
    MultiselectComponent,
    NavigationButtonsComponent,
    DatePipe,
    TooltipModule,
    AllianceLeverCardComponent
  ],
  templateUrl: './alliance-alignment.component.html'
})
export default class AllianceAlignmentComponent {
  environment = environment;
  getContractsService = inject(GetContractsService);
  private readonly getLeversService = inject(GetLeversService);
  body: WritableSignal<GetAllianceAlignment> = signal({
    contracts: [],
    result_sdgs: [],
    primary_levers: [],
    contributor_levers: []
  });
  apiService = inject(ApiService);
  cache = inject(CacheService);
  actions = inject(ActionsService);
  router = inject(Router);
  loading = signal(false);
  submission = inject(SubmissionService);
  versionWatcher = inject(VersionWatcherService);
  route = inject(ActivatedRoute);
  getContractStatusClasses = getContractStatusClasses;

  @ViewChild('containerRef') containerRef!: ElementRef;
  containerWidth = 0;

  private readonly leverOutcomeSignals = new Map<string | number, WritableSignal<{ result_lever_strategic_outcomes: LeverStrategicOutcome[] }>>();
  private readonly leverSdgSignals = new Map<string | number, WritableSignal<{ result_lever_sdgs: GetSdgs[] }>>();

  contractServiceParams = computed(() => {
    const indicatorId = this.cache.currentMetadata()?.indicator_id;
    return {
      'exclude-pooled-funding': indicatorId !== 5
    };
  });

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });
  }

  async getData() {
    this.leverOutcomeSignals.clear();
    this.leverSdgSignals.clear();

    const response = await this.apiService.GET_Alignments(this.cache.getCurrentNumericResultId());

    const normalizeSdgs = (sdgs: GetSdgs[] | undefined): GetSdgs[] =>
      (sdgs ?? []).map(sdg => ({
        ...sdg,
        sdg_id: (sdg as GetSdgs & { sdg_id?: number }).sdg_id ?? sdg.clarisa_sdg_id ?? sdg.id
      }));

    const mapLevers = (levers: Lever[] | undefined): Lever[] =>
      (levers ?? []).map(l => ({
        ...l,
        result_lever_sdgs: normalizeSdgs(l.result_lever_sdgs)
      }));

    let primary_levers = mapLevers(response.data.primary_levers);
    let contributor_levers = mapLevers(response.data.contributor_levers);

    const legacyRootSdgs = normalizeSdgs(response.data.result_sdgs);
    const anyLeverHasSdgs = [...primary_levers, ...contributor_levers].some(l => (l.result_lever_sdgs?.length ?? 0) > 0);

    if (legacyRootSdgs.length && !anyLeverHasSdgs) {
      const total = primary_levers.length + contributor_levers.length;
      if (total === 1) {
        if (primary_levers.length === 1) {
          primary_levers = [{ ...primary_levers[0], result_lever_sdgs: legacyRootSdgs }];
        } else if (contributor_levers.length === 1) {
          contributor_levers = [{ ...contributor_levers[0], result_lever_sdgs: legacyRootSdgs }];
        }
      }
    }

    this.body.set({
      contracts: response.data.contracts || [],
      result_sdgs: [],
      primary_levers,
      contributor_levers
    });
  }

  optionsDisabled: WritableSignal<Lever[]> = signal([]);
  primaryOptionsDisabled: WritableSignal<Lever[]> = signal([]);

  getPrimaryLeversForOptions(): Lever[] {
    return this.body().primary_levers || [];
  }

  getContributorLeversForOptions(): Lever[] {
    return this.body().contributor_levers || [];
  }

  getRequiredLeverIdsFromContracts(contracts: unknown[] | undefined): (string | number)[] {
    const list = contracts ?? [];
    const ordered: (string | number)[] = [];
    const seen = new Set<string>();
    for (const c of list) {
      const id = this.getLeverIdFromContract(c);
      if (id == null) continue;
      const key = String(id);
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push(id);
    }
    return ordered;
  }

  isLeverRequiredFromContributingProject(lever: Lever): boolean {
    return this.getRequiredLeverIdsFromContracts(this.body().contracts).some(id => String(id) === String(lever.lever_id));
  }

  private getLeverIdFromContract(contract: unknown): string | number | null {
    if (contract == null || typeof contract !== 'object') return null;
    const c = contract as Record<string, unknown>;
    const raw = c['levers'];
    let lv: unknown = raw;
    if (Array.isArray(lv)) lv = lv[0];
    if (lv && typeof lv === 'object') {
      const levers = lv as Record<string, unknown>;
      const name = levers['full_name'];
      if (name === 'Not available') return null;
      const id = levers['id'] ?? levers['lever_id'];
      if (id != null && id !== '') return id as string | number;
    }
    const top = c['lever_id'];
    if (top != null && top !== '') return top as string | number;
    return null;
  }

  private leverFromCatalog(entry: GetLevers): Lever {
    const lid = entry.lever_id ?? entry.id;
    return {
      result_lever_id: 0,
      result_id: 0,
      lever_id: lid,
      lever_role_id: 1,
      is_primary: true,
      short_name: entry.short_name,
      other_names: entry.other_names,
      icon: undefined,
      result_lever_sdgs: [],
      result_lever_strategic_outcomes: []
    };
  }

  private leverFromContractNested(
    nested: { id?: number; short_name?: string; other_names?: string; lever_url?: string },
    leverId: string | number
  ): Lever {
    return {
      result_lever_id: 0,
      result_id: 0,
      lever_id: leverId,
      lever_role_id: 1,
      is_primary: true,
      short_name: nested.short_name,
      other_names: nested.other_names,
      icon: nested.lever_url,
      result_lever_sdgs: [],
      result_lever_strategic_outcomes: []
    };
  }

  private findCatalogLever(leverId: string | number): GetLevers | undefined {
    const list = this.getLeversService.list() ?? [];
    return list.find(l => String(l.lever_id ?? l.id) === String(leverId));
  }

  private findNestedLeverShape(
    contracts: unknown[],
    leverId: string | number
  ): { short_name?: string; other_names?: string; lever_url?: string } | undefined {
    for (const c of contracts) {
      if (String(this.getLeverIdFromContract(c)) !== String(leverId)) continue;
      const raw = (c as Record<string, unknown>)['levers'];
      let lv: unknown = raw;
      if (Array.isArray(lv)) lv = lv[0];
      if (lv && typeof lv === 'object') return lv as { short_name?: string; other_names?: string; lever_url?: string };
    }
    return undefined;
  }

  private resolveLeverForPrimary(leverId: string | number, currentPrimaries: Lever[], contracts: unknown[]): Lever {
    const existing = currentPrimaries.find(l => String(l.lever_id) === String(leverId));
    if (existing) return existing;
    const cat = this.findCatalogLever(leverId);
    if (cat) return this.leverFromCatalog(cat);
    const nested = this.findNestedLeverShape(contracts, leverId);
    if (nested) return this.leverFromContractNested(nested, leverId);
    return {
      result_lever_id: 0,
      result_id: 0,
      lever_id: leverId,
      lever_role_id: 1,
      is_primary: true,
      result_lever_sdgs: [],
      result_lever_strategic_outcomes: []
    };
  }

  private computeMergedPrimaryLevers(): Lever[] {
    const b = this.body();
    const contracts = b.contracts ?? [];
    const current = b.primary_levers ?? [];
    const requiredIds = this.getRequiredLeverIdsFromContracts(contracts);
    const requiredSet = new Set(requiredIds.map(String));

    const requiredLevers = requiredIds.map(id => this.resolveLeverForPrimary(id, current, contracts));

    const optional = current.filter(l => !requiredSet.has(String(l.lever_id)));

    return [...requiredLevers, ...optional];
  }

  private samePrimaryLeverSequence(a: Lever[], b: Lever[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((x, i) => String(x.lever_id) === String(b[i]?.lever_id));
  }

  private readonly syncContractLeversToPrimaryEffect = effect(
    () => {
      this.body();
      this.getLeversService.list();
      const merged = this.computeMergedPrimaryLevers();
      const current = this.body().primary_levers ?? [];
      if (this.samePrimaryLeverSequence(current, merged)) {
        return;
      }
      this.body.update(prev => ({ ...prev, primary_levers: merged }));
    },
    { allowSignalWrites: true }
  );

  updateOptionsDisabledEffect = effect(
    () => {
      this.optionsDisabled.set(this.getPrimaryLeversForOptions());
    },
    { allowSignalWrites: true }
  );

  updatePrimaryOptionsDisabledEffect = effect(
    () => {
      const contracts = this.body().contracts;
      const contributor = this.getContributorLeversForOptions();
      const lockedStubs = this.getRequiredLeverIdsFromContracts(contracts).map(id => ({ lever_id: id }) as Lever);
      this.primaryOptionsDisabled.set([...contributor, ...lockedStubs]);
    },
    { allowSignalWrites: true }
  );

  canRemove = (): boolean => {
    return this.submission.isEditableStatus();
  };

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);

    const numericResultId = this.cache.getCurrentNumericResultId();
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;

    const navigateTo = (path: string) => {
      this.router.navigate(['result', this.cache.currentResultId(), path], {
        queryParams,
        replaceUrl: true
      });
    };

    const nextPath = this.cache.currentResultIndicatorSectionPath();

    if (this.submission.isEditableStatus()) {
      const normalizeOutcome = (value: unknown): LeverStrategicOutcome => {
        if (typeof value === 'number') {
          return { lever_strategic_outcome_id: value } as LeverStrategicOutcome;
        }
        if (value && typeof value === 'object') {
          const obj = value as Partial<LeverStrategicOutcome> & { id?: number };
          const idFromObject = obj.lever_strategic_outcome_id ?? obj.id;
          return { ...(obj as LeverStrategicOutcome), lever_strategic_outcome_id: idFromObject as number };
        }
        return { lever_strategic_outcome_id: 0 } as LeverStrategicOutcome;
      };

      const mergeLever = (l: Lever): Lever => {
        let next: Lever = { ...l };
        const outSig = this.leverOutcomeSignals.get(l.lever_id);
        if (outSig) {
          const raw: unknown = outSig().result_lever_strategic_outcomes as unknown;
          let normalized: LeverStrategicOutcome[] = [];
          if (Array.isArray(raw)) {
            normalized = (raw as unknown[]).map(normalizeOutcome);
          } else if (typeof raw === 'number' || (raw && typeof raw === 'object')) {
            normalized = [normalizeOutcome(raw)];
          }
          next = { ...next, result_lever_strategic_outcomes: normalized };
        }
        const sdgSig = this.leverSdgSignals.get(l.lever_id);
        if (sdgSig) {
          next = { ...next, result_lever_sdgs: sdgSig().result_lever_sdgs };
        }
        return next;
      };

      const primary_levers = this.body().primary_levers.map(mergeLever);
      const contributor_levers = this.body().contributor_levers.map(mergeLever);

      const sdgByKey = new Map<number, GetSdgs>();
      for (const lever of [...primary_levers, ...contributor_levers]) {
        for (const sdg of lever.result_lever_sdgs ?? []) {
          const id = sdg.id ?? (sdg as GetSdgs & { sdg_id?: number }).sdg_id ?? sdg.clarisa_sdg_id;
          if (id != null) sdgByKey.set(Number(id), sdg);
        }
      }

      const result_sdgs = [...sdgByKey.values()].map(sdg => ({
        created_at: sdg.created_at,
        is_active: sdg.is_active,
        updated_at: sdg.updated_at,
        clarisa_sdg_id: sdg.id ?? sdg.clarisa_sdg_id,
        result_id: numericResultId
      }));

      const dataToSend = {
        ...this.body(),
        primary_levers,
        contributor_levers,
        result_sdgs
      };

      const response = await this.apiService.PATCH_Alignments(numericResultId, dataToSend);
      if (response.successfulRequest) {
        this.actions.showToast({
          severity: 'success',
          summary: 'Alliance Alignment',
          detail: 'Data saved successfully'
        });

        await this.getData();
      }
    }
    if (page === 'back') navigateTo('general-information');
    else if (page === 'next') navigateTo(nextPath);
    this.loading.set(false);
  }

  markAsPrimary(
    item: { is_primary: boolean; contract_id?: string | number; lever_id?: string | number; sdg_id?: number },
    type: 'contract' | 'lever' | 'sdg'
  ) {
    this.body.update(current => {
      if (type === 'contract') {
        const contracts = current.contracts.map(contract => {
          const isTargetContract = contract.contract_id === item.contract_id;
          return {
            ...contract,
            is_primary: isTargetContract ? !contract.is_primary : false
          };
        });
        return { ...current, contracts };
      } else if (type === 'lever') {
        const updatedPrimaryLevers = current.primary_levers.map(lever => {
          const isTargetLever = lever.lever_id === item.lever_id;
          return {
            ...lever,
            is_primary: isTargetLever ? !lever.is_primary : false
          };
        });
        return { ...current, primary_levers: updatedPrimaryLevers };
      } else if (type === 'sdg') {
        const updatedResultSdgs = current.result_sdgs.map(sdg => {
          const sdgWithId = sdg as GetSdgs & { sdg_id?: number; is_primary?: boolean };
          const isTargetSdg = sdgWithId.sdg_id === item.sdg_id;
          return {
            ...sdg,
            is_primary: isTargetSdg ? !sdgWithId.is_primary : false
          } as GetSdgs & { sdg_id: number; is_primary: boolean };
        });
        return { ...current, result_sdgs: updatedResultSdgs };
      }
      return current;
    });
    this.actions.saveCurrentSection();
  }

  removePrimaryLever(lever: Lever) {
    if (!this.submission.isEditableStatus()) return;
    if (this.isLeverRequiredFromContributingProject(lever)) return;
    this.leverOutcomeSignals.delete(lever.lever_id);
    this.leverSdgSignals.delete(lever.lever_id);
    this.body.update(current => ({
      ...current,
      primary_levers: current.primary_levers.filter(l => l.lever_id !== lever.lever_id)
    }));
    this.actions.saveCurrentSection();
  }

  removeContributorLever(lever: Lever) {
    if (!this.submission.isEditableStatus()) return;
    this.leverOutcomeSignals.delete(lever.lever_id);
    this.leverSdgSignals.delete(lever.lever_id);
    this.body.update(current => ({
      ...current,
      contributor_levers: current.contributor_levers.filter(l => l.lever_id !== lever.lever_id)
    }));
    this.actions.saveCurrentSection();
  }

  getShortDescription(description: string): string {
    let max: number;
    if (this.containerWidth < 900) {
      max = 73;
    } else if (this.containerWidth < 1100) {
      max = 105;
    } else if (this.containerWidth < 1240) {
      max = 135;
    } else {
      max = 155;
    }
    return description.length > max ? description.slice(0, max) + '...' : description;
  }

  getLeverName(leverId: string | number): string {
    return `Lever ${leverId}`;
  }

  getLeverSignal(lever: Lever) {
    let s = this.leverOutcomeSignals.get(lever.lever_id);
    if (!s) {
      s = signal<{ result_lever_strategic_outcomes: LeverStrategicOutcome[] }>({
        result_lever_strategic_outcomes: lever.result_lever_strategic_outcomes || []
      });
      this.leverOutcomeSignals.set(lever.lever_id, s);
    }
    return s;
  }

  getLeverSdgSignal(lever: Lever) {
    let s = this.leverSdgSignals.get(lever.lever_id);
    if (!s) {
      s = signal<{ result_lever_sdgs: GetSdgs[] }>({
        result_lever_sdgs: lever.result_lever_sdgs || []
      });
      this.leverSdgSignals.set(lever.lever_id, s);
    }
    return s;
  }
}
