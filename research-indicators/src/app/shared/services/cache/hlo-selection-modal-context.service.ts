import { Injectable, signal } from '@angular/core';

/**
 * Payload the HLO selection modal needs when it opens.
 *
 * The modal otherwise sources its data from `BilateralService` (selected_levers,
 * indicatorGroups, pendingMappings) — the only per-open detail it needs is the
 * `resultCode` so the mutations on Save reach the right backend endpoint.
 *
 * Shape kept minimal on purpose; expand only when a real consumer needs it.
 */
export interface HloSelectionModalContext {
  resultCode: string;
}

/**
 * Singleton holding the active HLO-selection-modal payload.
 *
 * Consumers (e.g., the AI card click handler in `PoolFundingAlignmentComponent`)
 * call `setContext(...)` BEFORE invoking `allModalsService.openModal('hloSelection')`,
 * so the modal can read the context on init. Calling `clear()` on close keeps
 * the signal honest about what's currently open.
 *
 * Pattern mirrors `CreateResultManagementService` — `providedIn: 'root'`,
 * signal-based, minimal API surface.
 */
@Injectable({ providedIn: 'root' })
export class HloSelectionModalContextService {
  readonly context = signal<HloSelectionModalContext | null>(null);

  setContext(ctx: HloSelectionModalContext): void {
    this.context.set(ctx);
  }

  clear(): void {
    this.context.set(null);
  }
}
