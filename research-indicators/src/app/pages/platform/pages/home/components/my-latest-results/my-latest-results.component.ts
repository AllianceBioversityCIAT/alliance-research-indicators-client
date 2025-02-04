import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ButtonModule } from 'primeng/button';
import AboutIndicatorsComponent from '../../../about-indicators/about-indicators.component';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

export interface LatestResult {
  updated_at: Date;
  is_active: boolean;
  result_id: number;
  result_official_code: number;
  title: string;
  description: null;
  indicator_id: number;
  result_contracts: ResultContract;
  indicator: Indicator;
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
  standalone: true,
  imports: [ButtonModule, AboutIndicatorsComponent, DatePipe, RouterLink],
  templateUrl: './my-latest-results.component.html',
  styleUrl: './my-latest-results.component.scss'
})
export class MyLatestResultsComponent implements OnInit {
  api = inject(ApiService);
  allModalsService = inject(AllModalsService);

  latestResultList: WritableSignal<LatestResult[]> = signal([]);

  ngOnInit() {
    this.getLatestResults();
  }

  async getLatestResults() {
    const response = await this.api.GET_LatestResults();
    this.latestResultList.set(response.data);
  }
}
