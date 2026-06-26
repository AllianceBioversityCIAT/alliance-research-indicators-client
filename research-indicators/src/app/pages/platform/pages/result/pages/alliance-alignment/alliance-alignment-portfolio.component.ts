import { DatePipe } from '@angular/common';
import { Component, Input, WritableSignal, inject } from '@angular/core';
import { GetAllianceAlignment } from '@shared/interfaces/get-alliance-alignment.interface';
import { GetLevers, GetLeversParams } from '@shared/interfaces/get-levers.interface';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { MultiselectComponent } from '@shared/components/custom-fields/multiselect/multiselect.component';
import { TooltipModule } from 'primeng/tooltip';
import { getContractStatusClasses } from '@shared/constants/status-classes.constants';

@Component({
  selector: 'app-alliance-alignment-portfolio',
  imports: [MultiselectComponent, DatePipe, TooltipModule],
  templateUrl: './alliance-alignment-portfolio.component.html'
})
export class AllianceAlignmentPortfolioComponent {
  @Input({ required: true }) body!: WritableSignal<GetAllianceAlignment>;
  @Input() serviceParams: GetLeversParams | undefined;
  @Input() getShortDescription: (description: string) => string = description => description;
  @Input() canRemove: (item: unknown) => boolean = () => true;
  @Input() contractServiceParams: Record<string, unknown> = {};

  readonly submission = inject(SubmissionService);
  readonly cache = inject(CacheService);
  readonly getContractStatusClasses = getContractStatusClasses;

  readonly researchAreaFilter = (item: GetLevers) => this.matchesControlListType(item, ['research area', 'research_area', 'research-area']);
  readonly strategicObjectiveFilter = (item: GetLevers) =>
    this.matchesControlListType(item, ['strategic objective', 'strategic_objective', 'strategic-objective']);
  readonly impactOutcomeFilter = (item: GetLevers) => this.matchesControlListType(item, ['impact outcome', 'impact_outcome', 'impact-outcome']);

  shouldShowImpactOutcomes(): boolean {
    const indicatorId = Number(this.cache.currentMetadata()?.indicator_id);
    return indicatorId === 4 || indicatorId === 5;
  }

  private matchesControlListType(item: GetLevers, expectedTypes: string[]): boolean {
    const searchable = [item.type, item.group, item.category, item.name, item.full_name, item.short_name, item.other_names]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return expectedTypes.some(type => searchable.includes(type));
  }
}
