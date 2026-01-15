import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ButtonModule } from 'primeng/button';
import AboutIndicatorsComponent from '../../../about-indicators/about-indicators.component';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { CustomTagComponent } from '../../../../../../shared/components/custom-tag/custom-tag.component';
import { GreenChecks } from '@shared/interfaces/get-green-checks.interface';
import { LatestResult } from '@shared/interfaces/latest-result.interface';

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
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    const greenChecks = this.greenChecksByResult()[resultCode];
    if (!greenChecks) return 0;
    if (!result.indicator) return 0;
    
    if (greenChecks.completness === 1) {
      return 100;
    }
    
    const indicatorId = result.indicator.indicator_id;
    const steps = this.getSteps(indicatorId);

    const stepsToUse = steps.filter(key => key !== 'completness');
    const total = stepsToUse.length;
    const completed = stepsToUse.filter(key => greenChecks[key] === 1).length;

    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  protected getSteps(indicatorId: number): (keyof GreenChecks)[] {
    return [
      'general_information',
      'alignment',
      ...(indicatorId === 1 ? ['cap_sharing', 'cap_sharing_ip'] as (keyof GreenChecks)[] : []),
      ...(indicatorId === 4 ? ['policy_change'] as (keyof GreenChecks)[] : []),
      ...(indicatorId === 5 ? ['link_result', 'oicr'] as (keyof GreenChecks)[] : []),
      ...(indicatorId === 2 ? ['innovation_dev'] as (keyof GreenChecks)[] : []),
      'partners',
      'geo_location',
      'evidences',
      indicatorId === 1 || indicatorId === 2 ? 'ip_rights' : []
    ] as (keyof GreenChecks)[];
  }

  truncateTitle(title: string | null | undefined): string {
    const text = (title ?? '').trim();
    if (text === '') return '';
    const words = text.split(/\s+/);
    if (words.length <= 30) return text;
    return words.slice(0, 30).join(' ') + '...';
  }
}
