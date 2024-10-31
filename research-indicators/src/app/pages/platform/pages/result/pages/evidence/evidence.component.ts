import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { Router } from '@angular/router';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';

@Component({
  selector: 'app-evidence',
  standalone: true,
  imports: [ButtonModule, InputTextareaModule, FormsModule, InputTextModule],
  templateUrl: './evidence.component.html',
  styleUrl: './evidence.component.scss'
})
export default class EvidenceComponent {
  value: undefined;
  actions = inject(ActionsService);
  cache = inject(CacheService);
  router = inject(Router);

  async saveData(page?: 'next' | 'back') {
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
  }

  onSaveSection = effect(() => {
    if (this.actions.saveCurrentSectionValue()) this.saveData();
  });
}
