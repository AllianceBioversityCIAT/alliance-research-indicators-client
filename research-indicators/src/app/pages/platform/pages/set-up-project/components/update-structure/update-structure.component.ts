import { Component, inject, Input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { IndicatorsStructure } from '../../../../../../shared/interfaces/get-structures.interface';
import { InputTextModule } from 'primeng/inputtext';
import { SignalUtilsService } from '../../../../../../shared/services/signal-utils.service';
import { SetUpProjectService } from '../../set-up-project.service';

@Component({
  selector: 'app-update-structure',
  imports: [ButtonModule, FormsModule, InputTextModule],
  templateUrl: './update-structure.component.html',
  styleUrl: './update-structure.component.scss'
})
export class UpdateStructureComponent {
  @Input() index = 0;
  @Input() structure!: IndicatorsStructure;
  setUpProjectService = inject(SetUpProjectService);
  signalUtils = inject(SignalUtilsService);
  newStructureForm = signal<IndicatorsStructure>({ name: '', code: '' });
  constructor() {
    console.log('index', this.index);
    console.log(this.structure);
    this.newStructureForm.set(this.structure);
  }
  onUpdateStructure = () => {
    this.setUpProjectService.structures.update(prev => {
      prev[this.index] = this.newStructureForm();
      return [...prev];
    });
    this.setUpProjectService.showCreateStructure.set(false);
  };
}
