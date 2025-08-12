import { Component, inject, signal } from '@angular/core';
import { SetUpProjectService } from '../../set-up-project.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SignalUtilsService } from '../../../../../../shared/services/signal-utils.service';
import { IndicatorsStructure } from '../../../../../../shared/interfaces/get-structures.interface';

@Component({
  selector: 'app-create-structure',
  imports: [ButtonModule, InputTextModule],
  templateUrl: './create-structure.component.html',
  styleUrl: './create-structure.component.scss'
})
export class CreateStructureComponent {
  setUpProjectService = inject(SetUpProjectService);
  signalUtils = inject(SignalUtilsService);
  newStructureForm = signal<IndicatorsStructure>({ name: '', code: '' });
  onAddStructure = () => {
    this.signalUtils.pushToSignal(this.setUpProjectService.structures, this.newStructureForm());
    this.setUpProjectService.showCreateStructure.set(false);
  };
}
