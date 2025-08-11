import { Injectable } from '@angular/core';
import { GetContractsByUser, IndicatorElement } from '@shared/interfaces/get-contracts-by-user.interface';
import { GetProjectDetail } from '@shared/interfaces/get-project-detail.interface';
import { FindContracts } from '@shared/interfaces/find-contracts.interface';

export type ProjectType = GetContractsByUser | GetProjectDetail | FindContracts;

@Injectable({
  providedIn: 'root'
})
export class ProjectUtilsService {
  getStatusDisplay(project: ProjectType): {
    statusId: number;
    statusName: string;
  } {
    if ('status_id' in project && project.status_id) {
      return { statusId: project.status_id, statusName: project.status_name || 'Unknown' };
    }

    if ('contract_status' in project && project.contract_status) {
      const statusName = project.contract_status.toLowerCase();
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

  getLeverName(project: ProjectType): string {
    if ('lever' in project && project.lever) {
      if (typeof project.lever === 'string') {
        return project.lever;
      }
      return project.lever.short_name || project.lever.name || '-';
    }

    if ('lever_name' in project && project.lever_name) {
      return project.lever_name;
    }

    return '-';
  }

  hasField(project: ProjectType, fieldName: string): boolean {
    return fieldName in project && !!project[fieldName as keyof typeof project];
  }

  sortIndicators(indicators: IndicatorElement[]): IndicatorElement[] {
    const order = ['Capacity Sharing for Development', 'Innovation Development', 'Knowledge Product', 'Innovation Use', 'OICRS', 'Policy Change'];

    if (indicators && indicators.length > 0) {
      const uniqueIndicatorsMap = new Map<number, IndicatorElement>();

      indicators.forEach(indicator => {
        const indicatorId = indicator.indicator?.indicator_id;
        if (indicatorId && !uniqueIndicatorsMap.has(indicatorId)) {
          uniqueIndicatorsMap.set(indicatorId, {
            ...indicator,
            indicator_id: indicatorId
          });
        }
      });

      return Array.from(uniqueIndicatorsMap.values()).sort((a, b) => order.indexOf(a.indicator.name) - order.indexOf(b.indicator.name));
    }

    return indicators || [];
  }
}
