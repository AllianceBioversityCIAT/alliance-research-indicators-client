import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { AppConfigListItem } from '@shared/interfaces/app-config.interface';
import { JsonStructureEditorComponent } from '../json-structure-editor/json-structure-editor.component';
import {
  JsonEditorNode,
  JsonLeafValue,
  formatJsonFieldLabel
} from '@shared/utils/json-structure-editor.util';

@Component({
  selector: 'app-variable-configuration-json-row',
  standalone: true,
  imports: [FormsModule, InputTextModule, CheckboxModule, InputNumberModule, JsonStructureEditorComponent],
  templateUrl: './variable-configuration-json-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VariableConfigurationJsonRowComponent {
  readonly row = input.required<AppConfigListItem>();
  readonly sections = input.required<JsonEditorNode[]>();
  readonly values = input.required<Record<string, JsonLeafValue>>();
  readonly expandedSections = input.required<Record<string, boolean>>();
  readonly disabled = input(false);
  readonly saving = input(false);
  readonly dirty = input(false);
  readonly saveError = input<string | null>(null);
  readonly showActions = input(true);

  readonly sectionToggle = output<string>();
  readonly fieldChange = output<{ pathKey: string; value: JsonLeafValue }>();
  readonly save = output<void>();

  formatLabel = formatJsonFieldLabel;

  isSectionExpanded(sectionKey: string): boolean {
    return this.expandedSections()[sectionKey] === true;
  }

  fieldValue(pathKey: string): JsonLeafValue {
    return this.values()[pathKey] ?? '';
  }

  onStringChange(pathKey: string, value: string): void {
    this.fieldChange.emit({ pathKey, value });
  }

  onNumberChange(pathKey: string, value: number | null): void {
    this.fieldChange.emit({ pathKey, value: value ?? 0 });
  }

  onBooleanChange(pathKey: string, value: boolean): void {
    this.fieldChange.emit({ pathKey, value });
  }

  asBoolean(pathKey: string): boolean {
    return this.fieldValue(pathKey) === true;
  }

  asNumber(pathKey: string): number | null {
    const value = this.fieldValue(pathKey);
    if (typeof value === 'number') return value;
    if (value === '' || value == null) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  asString(pathKey: string): string {
    const value = this.fieldValue(pathKey);
    if (value == null) return '';
    return String(value);
  }
}
