import { Pipe, PipeTransform, inject } from '@angular/core';
import { formatUtcWithConfig, DateInput } from '@shared/utils/date-cet.util';
import type { DateFormatJsonValue } from '@shared/interfaces/date-format-config.interface';
import { DateFormatConfigService } from '@shared/services/date-format-config.service';

@Pipe({
  name: 'formatCet',
  standalone: true
})
export class FormatCetPipe implements PipeTransform {
  private readonly dateFormatConfig = inject(DateFormatConfigService);

  /**
   * @param value - Date to format (UTC string or Date)
   * @param config - Optional; pass dateFormatConfig.config() from template so the pipe re-runs when config loads/changes
   */
  transform(value: DateInput, config?: DateFormatJsonValue | null): string {
    const c = config ?? this.dateFormatConfig.config();
    return formatUtcWithConfig(value, c) ?? '';
  }
}
