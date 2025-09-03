import { Component, Input, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { SelectComponent } from '../select/select.component';
import { TextareaComponent } from '../textarea/textarea.component';
import { InputComponent } from '../input/input.component';
import { OICR_HELPER_TEXTS } from '@shared/constants/oicr-helper-texts.constants';
import { OicrCreation, PatchOicr } from '@shared/interfaces/oicr-creation.interface';

type OicrFormBody = OicrCreation | PatchOicr;

function isOicrCreation(body: OicrFormBody): body is OicrCreation {
  return 'step_one' in body;
}

function isPatchOicr(body: OicrFormBody): body is PatchOicr {
  return 'tagging' in body && !Array.isArray(body.tagging);
}

@Component({
  selector: 'app-oicr-form-fields',
  standalone: true,
  imports: [CommonModule, SelectComponent, TextareaComponent, InputComponent, TooltipModule],
  templateUrl: './oicr-form-fields.component.html'
})
export class OicrFormFieldsComponent {
  @Input() body!: WritableSignal<OicrFormBody>;
  @Input() mainContactPersonOptionValue: { body: string; option: string } = { body: 'main_contact_person.user_id', option: 'user_id' };
  @Input() oicrNoOptionValue = 'oicr_internal_code';
  @Input() taggingOptionValue: { body: string; option: string } = { body: 'tagging.tag_id', option: 'id' };
  @Input() oicrOptionValue: { body: string; option: string } = { body: 'link_result.external_oicr_id', option: 'id' };
  @Input() maturityLevelOptionValue: { body: string; option: string } = { body: 'maturity_level_id', option: 'id' };
  @Input() outcomeImpactOptionValue = 'outcome_impact_statement';
  @Input() shortOutcomeOptionValue = 'short_outcome_impact_statement';
  @Input() generalCommentOptionValue = 'general_comment';
  @Input() showMainContactPerson = false;
  @Input() showMaturityLevel = true;
  @Input() showShortOutcome = true;
  @Input() isOicrNoDisabled = false;
  @Input() clearOicrSelection: () => void = () => {
    // Default empty implementation - can be overridden by parent component
  };

  taggingHelperText = OICR_HELPER_TEXTS.taggingHelperText;
  outcomeImpactStatementHelperText = OICR_HELPER_TEXTS.outcomeImpactStatementHelperText;
  maturityLevelHelperText = OICR_HELPER_TEXTS.maturityLevelHelperText;
  shortOutcomeHelperText =
    'AI will draft a short outcome statement using the text from the Elaboration of outcome/impact statement field above. You can edit it anytime.';

  showOicrSelection(): boolean {
    const body = this.body();

    if (isOicrCreation(body)) {
      const tagging = body.step_one?.tagging;
      if (Array.isArray(tagging)) {
        return tagging[0]?.tag_id === 2 || tagging[0]?.tag_id === 3;
      }
      return tagging?.tag_id === 2 || tagging?.tag_id === 3;
    }

    if (isPatchOicr(body)) {
      return body.tagging?.tag_id === 2 || body.tagging?.tag_id === 3;
    }

    return false;
  }
}
