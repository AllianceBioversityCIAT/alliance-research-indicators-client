import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { AIAssistantResult } from '../../../../models/AIAssistantResult';
import { CreateResultManagementService } from '../../../../services/create-result-management.service';
import { ButtonModule } from 'primeng/button';

type DetailValue = 'total_participants' | 'non_binary_participants' | 'female_participants' | 'male_participants';

@Component({
  selector: 'app-result-ai-item',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './result-ai-item.component.html',
  styleUrl: './result-ai-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultAiItemComponent {
  @Input() item!: AIAssistantResult;
  expandedItemDetails = [
    { title: 'Total participants', value: 'total_participants' as DetailValue },
    { title: 'Non-binary', value: 'non_binary_participants' as DetailValue },
    { title: 'Female', value: 'female_participants' as DetailValue },
    { title: 'Male', value: 'male_participants' as DetailValue }
  ];

  indicatorTypeIcon = [
    { icon: 'group', type: 'Capacity Sharing for Development', class: 'output-icon' },
    { icon: 'flag', type: 'Innovation Development', class: 'output-icon' },
    { icon: 'lightbulb', type: 'Knowledge Product', class: 'output-icon' },
    { icon: 'wb_sunny', type: 'Innovation Use', class: 'outcome-icon' },
    { icon: 'pie_chart', type: 'Research Output', class: 'outcome-icon' },
    { icon: 'folder_open', type: 'Policy Change', class: 'outcome-icon' }
  ];

  createResultManagementService = inject(CreateResultManagementService);

  getIndicatorTypeIcon(type: string) {
    return {
      class: this.indicatorTypeIcon.find(icon => icon.type === type)?.class,
      icon: this.indicatorTypeIcon.find(icon => icon.type === type)?.icon
    };
  }

  toggleExpand(item: AIAssistantResult) {
    this.createResultManagementService.expandedItem.set(this.createResultManagementService.expandedItem() === item ? null : item);
  }

  discardResult(item: AIAssistantResult) {
    this.createResultManagementService.items.update(items => items.filter(i => i !== item));
  }

  createResult(item: AIAssistantResult) {
    console.error('Creating result:', item);
  }
}
