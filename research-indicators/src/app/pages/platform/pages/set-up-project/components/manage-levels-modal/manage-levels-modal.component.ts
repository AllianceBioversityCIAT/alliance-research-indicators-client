import { Component, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SetUpProjectService } from '../../set-up-project.service';
import { Level } from '../../../../../../shared/interfaces/get-structures.interface';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-levels-modal',
  imports: [DialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './manage-levels-modal.component.html',
  styleUrl: './manage-levels-modal.component.scss'
})
export class ManageLevelsModalComponent {
  setUpProjectService = inject(SetUpProjectService);
  body = signal({ title: null });
  addCustomField = (level: Level) => {
    const nextId = this.getNextAvailableId(level.custom_fields);
    level.custom_fields.push({ fieldID: nextId, field_name: '' });
  };

  /**
   * Generates the next available unique ID for custom fields
   * Time complexity: O(n log n) in worst case, O(1) in best case
   * Space complexity: O(1)
   */
  private getNextAvailableId(customFields: { fieldID: number | null }[]): number {
    if (customFields.length === 0) {
      return 1;
    }

    // Filter out null values and sort existing IDs
    const existingIds = customFields
      .map(field => field.fieldID)
      .filter((id): id is number => id !== null)
      .sort((a, b) => a - b);

    // If no valid IDs exist, start with 1
    if (existingIds.length === 0) {
      return 1;
    }

    // Check for gaps in the sequence starting from 1
    for (let i = 0; i < existingIds.length; i++) {
      const expectedId = i + 1;
      if (existingIds[i] !== expectedId) {
        return expectedId;
      }
    }

    // No gaps found, return next sequential number
    return existingIds.length + 1;
  }

  removeCustomField = (level: Level, index: number) => {
    level.custom_fields.splice(index, 1);
  };

  onSave() {
    this.setUpProjectService.showManageLevelsModal.set(false);
    this.setUpProjectService.saveStructures();
  }
}
