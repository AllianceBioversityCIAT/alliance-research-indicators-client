import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ButtonModule } from 'primeng/button';
import AboutIndicatorsComponent from '../../../about-indicators/about-indicators.component';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { CustomTagComponent } from '../../../../../../shared/components/custom-tag/custom-tag.component';
import { GreenChecks } from '@shared/interfaces/get-green-checks.interface';
import { STATUS_COLOR_MAP } from '@shared/constants/status-colors';
import { StatusConfig } from '@shared/interfaces/result-config.interface';

export interface LatestResult {
  updated_at: Date;
  is_active: boolean;
  result_id: number;
  result_official_code: number;
  platform_code: string;
  title: string;
  description: null;
  indicator_id: number;
  result_status: ResultStatus;
  result_contracts: ResultContract;
  indicator: Indicator;
}
export interface ResultStatus {
  created_at: string;
  updated_at: string;
  is_active: boolean;
  result_status_id: number;
  name: string;
  description: string | null;
  config: StatusConfig;
}

export interface Indicator {
  is_active: boolean;
  indicator_id: number;
  name: string;
  other_names: null;
  description: string;
  long_description: string;
  indicator_type_id: number;
  icon_src: string;
}

export interface ResultContract {
  is_active: boolean;
  result_contract_id: number;
  result_id: number;
  contract_id: string;
  contract_role_id: number;
  is_primary: boolean;
  agresso_contract: AgressoContract;
}

export interface AgressoContract {
  is_active: boolean;
  agreement_id: string;
  contract_status: string;
  description: string;
  division: null;
  donor: string;
  donor_reference: string;
  endDateGlobal: Date;
  endDatefinance: Date;
  end_date: Date;
  entity: string;
  extension_date: Date;
  funding_type: string;
  project: string;
  projectDescription: string;
  project_lead_description: string;
  short_title: string;
  start_date: Date;
  ubwClientDescription: string;
  unit: null;
  office: null;
}

@Component({
  selector: 'app-my-latest-results',
  imports: [ButtonModule, AboutIndicatorsComponent, DatePipe, RouterLink, CustomTagComponent],
  templateUrl: './my-latest-results.component.html',
  styleUrl: './my-latest-results.component.scss'
})
export class MyLatestResultsComponent implements OnInit {
  api = inject(ApiService);
  allModalsService = inject(AllModalsService);
  greenChecksByResult: WritableSignal<Record<string, GreenChecks>> = signal({});

  latestResultList: WritableSignal<LatestResult[]> = signal([]);

  ngOnInit() {
    this.loadLatestResultsWithGreenChecks();
  }

  async loadLatestResultsWithGreenChecks() {
    const results = await this.api.GET_LatestResults();
    this.latestResultList.set(results.data);

    for (const result of results.data) {
      const resultCode = `${result.platform_code}-${result.result_official_code}`;
      const { data } = await this.api.GET_GreenChecks(result.result_official_code, result.platform_code);
      this.greenChecksByResult.update(map => ({
        ...map,
        [resultCode]: data
      }));
    }
  }

  calculateProgressFor(result: LatestResult): number {
    if (!result) return 0;
    const greenChecks = this.greenChecksByResult()[result.result_official_code];
    if (!greenChecks) return 0;
    if (!result.indicator) return 0;
    const indicatorId = result.indicator.indicator_id;

    const steps = this.getSteps(indicatorId);

    const total = steps.length;
    const completed = steps.filter(key => greenChecks[key] === 1).length;

    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  protected getSteps(indicatorId: number): (keyof GreenChecks)[] {
    return [
      'general_information',
      'alignment',
      ...(indicatorId === 1 ? ['cap_sharing', 'cap_sharing_ip'] as (keyof GreenChecks)[] : []),
      ...(indicatorId === 4 ? ['policy_change'] as (keyof GreenChecks)[] : []),
      'partners',
      'geo_location',
      'evidences'
    ] as (keyof GreenChecks)[];
  }

  getStatusColor(result: LatestResult) {
    const statusId = String(result.result_status?.result_status_id ?? '');
    return STATUS_COLOR_MAP[statusId]?.text || STATUS_COLOR_MAP[''].text;
  }

  truncateTitle(title: string | null | undefined): string {
    const text = (title ?? '').trim();
    if (text === '') return '';
    const words = text.split(/\s+/);
    if (words.length <= 30) return text;
    return words.slice(0, 30).join(' ') + '...';
  }
}
