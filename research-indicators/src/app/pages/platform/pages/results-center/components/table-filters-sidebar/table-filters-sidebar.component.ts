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

  @Input() showSignal = signal(false);
  @Input() confirmSidebarEvent = output<void>();

  toggleSidebar() {
    this.showSignal.update(prev => !prev);
  }
}
