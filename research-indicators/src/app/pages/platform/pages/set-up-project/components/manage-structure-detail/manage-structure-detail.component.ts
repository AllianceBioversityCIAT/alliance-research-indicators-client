import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SetUpProjectService } from '../../set-up-project.service';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';

@Component({
  selector: 'app-manage-structure-detail',
  imports: [DialogModule, ButtonModule, InputComponent, FormsModule],
  templateUrl: './manage-structure-detail.component.html',
  styleUrl: './manage-structure-detail.component.scss'
})
export class ManageStructureDetailComponent {
  setUpProjectService = inject(SetUpProjectService);
  body = this.setUpProjectService.structureDetailBody;
  saveStructure = () => {
    const modal = this.setUpProjectService.structureDetailModal();
    const structure = modal.structure;
    if (!structure) return;

    const isEditingMode = modal.editingMode;

    if (!isEditingMode) {
      // Creating new structure (similar to old addStructure logic)
      if (!this.body().name || !this.body().code) return;

      this.setUpProjectService.structures.update(structures => {
        // Add new structure with the form data
        structures.push({
          id: null,
          name: this.body().name,
          code: this.body().code,
          items: [],
          indicators: [],
          custom_values: this.body().custom_values.map(customValue => customValue()),
          newStructure: true
        });
        return [...structures];
      });

      this.setUpProjectService.collapseAllStructures();
    } else {
      // Editing existing structure (original logic)
      if (structure.isParent) {
        // Logic for level 1 (parent)
        if (!this.body().code) return;
        this.setUpProjectService.structures.update(structures => {
          const foundStructure = structures.find(s => s.id === structure.id);
          if (foundStructure) {
            foundStructure.name = this.body().name;
            foundStructure.code = this.body().code;
            foundStructure.custom_values = this.body().custom_values.map(customValue => customValue());
          }
          return [...structures];
        });
      } else {
        // Logic for level 2 (child)
        if (!this.body().name || !this.body().code) return;
        this.setUpProjectService.structures.update(structures => {
          const item = structures.find(s => s.id === structure.parent_id)?.items?.find(i => i.id === structure.id);

          if (item) {
            item.name = this.body().name;
            item.code = this.body().code;
            item.custom_values = this.body().custom_values.map(customValue => customValue());
          }
          return [...structures];
        });
      }
    }

    this.setUpProjectService.saveStructures();
    this.body.set({ code: '', name: '', custom_values: [] });
    this.setUpProjectService.structureDetailModal.set({ show: false });
  };

  clearBody = () => {
    this.body.set({ code: '', name: '', custom_values: [] });
  };
}
