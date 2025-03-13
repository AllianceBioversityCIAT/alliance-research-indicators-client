import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CacheService } from '../../services/cache/cache.service';
import { CustomTagComponent } from '../custom-tag/custom-tag.component';
import { GreenChecks } from '../../interfaces/get-green-checks.interface';
import { CommonModule } from '@angular/common';
import { ActionsService } from '@shared/services/actions.service';
import { TooltipModule } from 'primeng/tooltip';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

interface SidebarOption {
  label: string;
  path: string;
  indicator_id?: number;
  disabled?: boolean;
  underConstruction?: boolean;
  hide?: boolean;
  greenCheckKey: string;
  greenCheck?: boolean;
}

@Component({
  selector: 'app-result-sidebar',
  imports: [RouterLink, RouterLinkActive, ButtonModule, CustomTagComponent, CommonModule, TooltipModule],
  templateUrl: './result-sidebar.component.html',
  styleUrl: './result-sidebar.component.scss'
})
export class ResultSidebarComponent {
  cache = inject(CacheService);
  actions = inject(ActionsService);
  allModalsService = inject(AllModalsService);

  allOptionsWithGreenChecks = computed(() => {
    return this.allOptions()
      .filter(option => option?.indicator_id === this.cache.currentMetadata()?.indicator_id || !option?.indicator_id)
      .map(option => ({
        ...option,
        greenCheck: Boolean(this.cache.greenChecks()[option.greenCheckKey as keyof GreenChecks])
      }));
  });

  allOptions: WritableSignal<SidebarOption[]> = signal([
    {
      label: 'General information',
      path: 'general-information',
      greenCheckKey: 'general_information'
    },
    {
      label: 'Alliance Alignment',
      path: 'alliance-alignment',
      greenCheckKey: 'alignment'
    },
    {
      label: 'Capacity Sharing',
      path: 'capacity-sharing',
      indicator_id: 1,
      greenCheckKey: 'cap_sharing'
    },
    {
      label: 'Policy Change details',
      path: 'policy-change',
      indicator_id: 4,
      greenCheckKey: 'completness'
    },
    {
      label: 'Partners',
      path: 'partners',
      greenCheckKey: 'partners'
    },
    {
      label: 'Geographic scope',
      path: 'geographic-scope',
      underConstruction: false,
      hide: false,
      greenCheckKey: 'geo_location'
    },
    {
      label: 'Evidence',
      path: 'evidence',
      greenCheckKey: 'evidences'
    }
  ]);
}