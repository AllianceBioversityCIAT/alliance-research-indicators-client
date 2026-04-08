import { Component, Input, output, WritableSignal } from '@angular/core';
import { Lever, LeverStrategicOutcome } from '@shared/interfaces/oicr-creation.interface';
import { GetSdgs } from '@shared/interfaces/get-sdgs.interface';
import { MultiselectComponent } from '@shared/components/custom-fields/multiselect/multiselect.component';

@Component({
  selector: 'app-alliance-lever-card',
  standalone: true,
  imports: [MultiselectComponent],
  templateUrl: './alliance-lever-card.component.html',
  styleUrl: './alliance-lever-card.component.scss'
})
export class AllianceLeverCardComponent {
  readonly allowRemove = (): boolean => true;

  removeLever = output<void>();

  @Input({ required: true }) lever!: Lever;
  @Input({ required: true }) sdgSignal!: WritableSignal<{ result_lever_sdgs: GetSdgs[] }>;
  @Input({ required: true }) outcomeSignal!: WritableSignal<{ result_lever_strategic_outcomes: LeverStrategicOutcome[] }>;

  @Input() showStrategicOutcomes = false;
  @Input() strategicOutcomesRequired = false;
  @Input() sdgTargetsRequired = true;

  @Input() disabled = false;
}
