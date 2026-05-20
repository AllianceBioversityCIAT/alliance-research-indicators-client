/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-notion-block',
  imports: [FormsModule, CheckboxModule, CommonModule, DynamicNotionBlockComponent],
  templateUrl: './dynamic-notion-block.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicNotionBlockComponent {
  @Input() block: any;
  isExpanded = signal(false);

  private readonly router = inject(Router);

  navigateToChildPage(id: string): void {
    this.router.navigate(['/whats-new/details', id]);
  }

  toggleExpand(): void {
    this.isExpanded.update(current => !current);
  }

  joinText(text: any[]): string {
    if (!text?.length) {
      return '';
    }

    const processedText = text.map(item => {
      let formattedText = item.plain_text;

      if (item.annotations) {
        if (item.annotations.bold) {
          formattedText = `<span class="font-semibold">${formattedText}</span>`;
        }
        if (item.annotations.italic) {
          formattedText = `<em>${formattedText}</em>`;
        }
        if (item.annotations.underline) {
          formattedText = `<u>${formattedText}</u>`;
        }
        if (item.annotations.strikethrough) {
          formattedText = `<s>${formattedText}</s>`;
        }
        if (item.annotations.code) {
          formattedText = `<code class="rounded bg-[#f4f7f9] px-1 py-0.5">${formattedText}</code>`;
        }
      }

      if (item.href) {
        if (item.mention) {
          formattedText = `<a href="${item.href}" target="_blank" rel="noopener noreferrer" class="text-[#1689ca]">${item.href}</a>`;
        } else {
          formattedText = `<a href="${item.href}" target="_blank" rel="noopener noreferrer" class="text-[#1689ca]">${formattedText}</a>`;
        }
      }

      return formattedText;
    });

    return processedText.join('');
  }
}
