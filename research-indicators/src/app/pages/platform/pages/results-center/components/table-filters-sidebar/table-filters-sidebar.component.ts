import { Component, inject, Input, output, signal, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { ResultsCenterService } from '../../results-center.service';

@Component({
    selector: 'app-table-filters-sidebar',
    imports: [FormsModule, MultiSelectModule, ButtonModule, MultiselectComponent],
    templateUrl: './table-filters-sidebar.component.html',
    styleUrl: './table-filters-sidebar.component.scss'
})
export class TableFiltersSidebarComponent implements AfterViewInit {
  @ViewChild('indicatorSelect') indicatorSelect?: MultiselectComponent;
  @ViewChild('statusSelect') statusSelect?: MultiselectComponent;
  @ViewChild('projectSelect') projectSelect?: MultiselectComponent;
  @ViewChild('leverSelect') leverSelect?: MultiselectComponent;
  @ViewChild('yearSelect') yearSelect?: MultiselectComponent;

  resultsCenterService = inject(ResultsCenterService);

  @Input() showSignal = signal(false);
  @Input() confirmSidebarEvent = output<void>();

  toggleSidebar() {
    this.showSignal.update(prev => !prev);
  }

  ngAfterViewInit() {
    this.resultsCenterService.multiselectRefs.set({
      indicator: this.indicatorSelect!,
      status: this.statusSelect!,
      project: this.projectSelect!,
      lever: this.leverSelect!,
      year: this.yearSelect!
    });
  }
}
