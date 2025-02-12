import { Component, inject, Input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { ResultsCenterService } from '../../results-center.service';
import { GetLevers } from '../../../../../../shared/interfaces/get-levers.interface';
import { GetAllResultStatus } from '../../../../../../shared/interfaces/get-all-result-status.interface';
import { GetContracts } from '../../../../../../shared/interfaces/get-contracts.interface';
import { GetAllIndicators } from '../../../../../../shared/interfaces/get-all-indicators.interface';
@Component({
  selector: 'app-table-filters-sidebar',
  standalone: true,
  imports: [FormsModule, MultiSelectModule, ButtonModule, MultiselectComponent],
  templateUrl: './table-filters-sidebar.component.html',
  styleUrl: './table-filters-sidebar.component.scss'
})
export class TableFiltersSidebarComponent {
  resultsCenterService = inject(ResultsCenterService);
  tableFilters = signal({ levers: [], statusCodes: [], years: [], contracts: [], indicators: [] });
  @Input() showSignal = signal(false);
  @Input() confirmSidebarEvent = output<void>();

  applyFilters = () => {
    this.resultsCenterService.resultsFilter.update(prev => ({
      ...prev,
      'lever-codes': this.tableFilters().levers.map((lever: GetLevers) => lever.id),
      'status-codes': this.tableFilters().statusCodes.map((status: GetAllResultStatus) => status.result_status_id),
      years: this.tableFilters().years.map((year: { id: number; name: string }) => year.id),
      'contract-codes': this.tableFilters().contracts.map((contract: GetContracts) => contract.agreement_id),
      'indicator-codes-filter': this.tableFilters().indicators.map((indicator: GetAllIndicators) => indicator.indicator_id)
    }));
  };

  toggleSidebar() {
    this.showSignal.update(prev => !prev);
  }
}
