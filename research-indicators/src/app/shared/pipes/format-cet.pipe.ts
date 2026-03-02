import { Pipe, PipeTransform } from '@angular/core';
import { formatUtcToCetDisplay, DateInput } from '@shared/utils/date-cet.util';

@Pipe({
  name: 'formatCet',
  standalone: true
})
export class FormatCetPipe implements PipeTransform {
  transform(value: DateInput): string {
    return formatUtcToCetDisplay(value) ?? '';
  }
}
