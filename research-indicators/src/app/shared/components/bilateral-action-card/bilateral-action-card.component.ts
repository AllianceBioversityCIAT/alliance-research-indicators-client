import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

/**
 * Reusable "promo / call-to-action" card. Originated for the bilateral
 * Pool Funding Alignment AI card per Figma node `32471:129636`
 * ("VIEW HIGH LEVEL OUTPUTS"). Visual: 1036×103 card, 73×73 illustration on
 * the left, uppercase title, body text, green CTA button on the right.
 */
@Component({
  selector: 'app-bilateral-action-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './bilateral-action-card.component.html',
  styleUrl: './bilateral-action-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BilateralActionCardComponent {
  /** Optional illustration img src. When absent, a default icon renders. */
  @Input() illustration: string | null = null;
  /** Uppercase tracked heading. */
  @Input() title = '';
  /** Body copy. Plain text; renders in Barlow 14px / 17px / --ac-grey-700. */
  @Input() body = '';
  /** CTA button label. Default per OQ-FIG-5 resolution. */
  @Input() ctaLabel = 'View HLOs';
  /** CTA icon class (PrimeIcons). */
  @Input() ctaIcon = 'pi pi-folder';
  /** When true, the CTA button is disabled. */
  @Input() disabled = false;
  /** Accessible label for the CTA — describes the action, not the label. */
  @Input() ctaAriaLabel = 'Open High Level Outputs selector';

  /** Emitted when the CTA button is clicked and the component is not disabled. */
  @Output() ctaClick = new EventEmitter<void>();

  /** Stable id for `aria-labelledby` wiring between region + heading. */
  readonly titleId = `bilateral-action-card-title-${BilateralActionCardComponent.counter++}`;

  private static counter = 0;

  onCtaClick(): void {
    if (this.disabled) return;
    this.ctaClick.emit();
  }
}
