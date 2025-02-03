import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiselectComponent } from '@shared/components/custom-fields/multiselect/multiselect.component';
import { PatchPartners } from '@shared/interfaces/patch-partners.interface';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-table-filters-sidebar',
  standalone: true,
  imports: [FormsModule, MultiSelectModule, ButtonModule, MultiselectComponent],
  templateUrl: './table-filters-sidebar.component.html',
  styleUrl: './table-filters-sidebar.component.scss'
})
export class TableFiltersSidebarComponent {
  @Input() hideSidebar = true;

  body = signal<PatchPartners>(new PatchPartners());

  toggleSidebar() {
    this.hideSidebar = !this.hideSidebar;
  }

  hideSidebarMethod() {
    this.hideSidebar = true;
  }
}
