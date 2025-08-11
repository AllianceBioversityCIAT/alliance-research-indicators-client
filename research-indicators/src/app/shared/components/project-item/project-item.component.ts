import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GetContractsByUser } from '@shared/interfaces/get-contracts-by-user.interface';
import { GetProjectDetail } from '@shared/interfaces/get-project-detail.interface';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';

@Component({
  selector: 'app-project-item',
  imports: [RouterLink, DatePipe, CustomTagComponent],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.scss'
})
export class ProjectItemComponent implements OnInit {
  @Input() isHeader = false;
  @Input() project: GetContractsByUser | GetProjectDetail | FindContracts = {};

  ngOnInit(): void {
    const order = ['Capacity Sharing for Development', 'Innovation Development', 'Knowledge Product', 'Innovation Use', 'OICRS', 'Policy Change'];

    if (this.project.indicators && this.project.indicators.length > 0) {
      // Crear un mapa para eliminar duplicados de manera más eficiente
      const uniqueIndicatorsMap = new Map();

      this.project.indicators.forEach(indicator => {
        const indicatorId = indicator.indicator?.indicator_id;
        if (indicatorId && !uniqueIndicatorsMap.has(indicatorId)) {
          uniqueIndicatorsMap.set(indicatorId, {
            ...indicator,
            indicator_id: indicatorId
          });
        }
      });

      // Convertir el mapa de vuelta a array y ordenar
      this.project.indicators = Array.from(uniqueIndicatorsMap.values()).sort(
        (a, b) => order.indexOf(a.indicator.name) - order.indexOf(b.indicator.name)
      );
    }
  }

  getStatusDisplay(): {
    statusId: number;
    statusName: string;
  } {
    if ('status_id' in this.project && this.project.status_id) {
      return { statusId: this.project.status_id, statusName: this.project.status_name || 'Unknown' };
    }

    if ('contract_status' in this.project && this.project.contract_status) {
      const statusName = this.project.contract_status.toLowerCase();
      const statusMap: Record<string, { id: number; name: string }> = {
        ongoing: { id: 1, name: 'Ongoing' },
        completed: { id: 2, name: 'Completed' },
        suspended: { id: 3, name: 'Suspended' },
        approved: { id: 6, name: 'Approved' }
      };

      const status = statusMap[statusName];
      if (status) {
        return { statusId: status.id, statusName: status.name };
      }
    }

    return { statusId: 1, statusName: 'Ongoing' };
  }

  hasLever(): boolean {
    return 'lever' in this.project && !!this.project.lever;
  }

  getLeverName(): string {
    if ('lever' in this.project && this.project.lever) {
      if (typeof this.project.lever === 'string') {
        return this.project.lever;
      }
      return this.project.lever.short_name || this.project.lever.name || '-';
    }
    return '-';
  }
}
