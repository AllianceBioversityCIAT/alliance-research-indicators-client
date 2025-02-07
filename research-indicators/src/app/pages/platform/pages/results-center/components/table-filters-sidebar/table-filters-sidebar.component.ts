import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatchPartners } from '@shared/interfaces/patch-partners.interface';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';

@Component({
  selector: 'app-table-filters-sidebar',
  standalone: true,
  imports: [FormsModule, MultiSelectModule, ButtonModule, MultiselectComponent],
  templateUrl: './table-filters-sidebar.component.html',
  styleUrl: './table-filters-sidebar.component.scss'
})
export class TableFiltersSidebarComponent {
  @Input() showSignal = signal(false);

  body = signal<PatchPartners>(new PatchPartners());

  toggleSidebar() {
    this.showSignal.update(prev => !prev);
  }
}
