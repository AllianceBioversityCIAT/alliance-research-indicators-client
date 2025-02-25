import { Component, computed, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CacheService } from '../../services/cache/cache.service';
import { CustomTagComponent } from '../custom-tag/custom-tag.component';
import { ApiService } from '../../services/api.service';
interface SidebarOption {
  label: string;
  path: string;
  indicator_id?: number;
  disabled?: boolean;
  underConstruction?: boolean;
  hide?: boolean;
  greenCheckKey: string;
}

type GreenChecks = Record<string, boolean>;
@Component({
  selector: 'app-result-sidebar',
  imports: [RouterLink, RouterLinkActive, ButtonModule, CustomTagComponent],
  templateUrl: './result-sidebar.component.html',
  styleUrl: './result-sidebar.component.scss'
})
export class ResultSidebarComponent implements OnInit {
  cache = inject(CacheService);
  api = inject(ApiService);

  greenChecks = signal<GreenChecks>({});
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getData();
  }

  async getData() {
    const response = await this.api.getGreenChecks();
    this.greenChecks.set(response.data);
    console.log(this.greenChecks());
  }

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

  options = computed(() => {
    return this.allOptions().filter(option => option.indicator_id === this.cache.currentMetadata().indicator_id || !option.indicator_id);
  });
}
