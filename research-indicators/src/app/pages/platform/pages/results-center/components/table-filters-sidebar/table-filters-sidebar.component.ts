import { Component, effect, inject, Input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { ResultsCenterService } from '../../results-center.service';
import { GetLevers } from '../../../../../../shared/interfaces/get-levers.interface';
@Component({
  selector: 'app-table-filters-sidebar',
  standalone: true,
  imports: [FormsModule, MultiSelectModule, ButtonModule, MultiselectComponent],
  templateUrl: './table-filters-sidebar.component.html',
  styleUrl: './table-filters-sidebar.component.scss'
})
export class TableFiltersSidebarComponent {
  resultsCenterService = inject(ResultsCenterService);
  tableFilters = signal({ levers: [] });
  @Input() showSignal = signal(false);
  @Input() confirmSidebarEvent = output<void>();

  applyFilters = () => {
    this.resultsCenterService.resultsFilter.update(prev => ({
      ...prev,
      'lever-codes': this.tableFilters().levers.map((lever: GetLevers) => lever.id)
    }));
    console.log('onChangeFilters');
  };

  toggleSidebar() {
    this.showSignal.update(prev => !prev);
  }
}
