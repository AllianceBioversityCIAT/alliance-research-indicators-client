import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { Router } from '@angular/router';

interface Organizations {
  name: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [ButtonModule, FormsModule, MultiSelectModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export default class PartnersComponent implements OnInit {
  actions = inject(ActionsService);
  cache = inject(CacheService);
  organizations!: Organizations[];
  router = inject(Router);

  selectedOrganizations!: Organizations[];

  ngOnInit() {
    this.organizations = [{ name: 'WUR - Netherlands' }, { name: 'MARI - Tanzania, United Republic' }, { name: 'INRAB - Benin' }, { name: 'NARO - Uganda' }, { name: 'MARTI - Tanzania' }];
  }

  async saveData(page?: 'next' | 'back') {
    // console.log(this.selectedOrganizations);
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'evidence']);
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'general-information']);
  }

  onSaveSection = effect(() => {
    if (this.actions.saveCurrentSectionValue()) this.saveData();
  });
}
