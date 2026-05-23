import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BilateralActionCardComponent } from './bilateral-action-card.component';

describe('BilateralActionCardComponent', () => {
  let component: BilateralActionCardComponent;
  let fixture: ComponentFixture<BilateralActionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BilateralActionCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BilateralActionCardComponent);
    component = fixture.componentInstance;
  });

  function el<T extends HTMLElement = HTMLElement>(testId: string): T | null {
    return fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
  }

  describe('input rendering', () => {
    it('renders the title and body inputs verbatim', () => {
      component.title = 'VIEW HIGH LEVEL OUTPUTS';
      component.body =
        'Browse and select the High-Level Outputs associated with this result. You can review their details before linking them to ensure proper alignment and reporting accuracy.';
      fixture.detectChanges();

      expect(el('bilateral-action-card-title')?.textContent).toBe('VIEW HIGH LEVEL OUTPUTS');
      expect(el('bilateral-action-card-body')?.textContent).toContain(
        'Browse and select the High-Level Outputs associated with this result.'
      );
    });

    it('default CTA label resolves OQ-FIG-5: View HLOs (not the mockup placeholder "Upload file")', () => {
      fixture.detectChanges();
      expect(component.ctaLabel).toBe('View HLOs');
    });

    it('default CTA icon is the pi pi-folder PrimeIcon', () => {
      fixture.detectChanges();
      expect(component.ctaIcon).toBe('pi pi-folder');
    });
  });

  describe('illustration', () => {
    it('renders the provided img when `illustration` is set', () => {
      component.illustration = '/assets/test-image.png';
      fixture.detectChanges();
      const img = (el('bilateral-action-card-illustration') as HTMLElement)?.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toBe('/assets/test-image.png');
    });

    it('falls back to a PrimeIcon when no illustration is provided', () => {
      fixture.detectChanges();
      const wrap = el('bilateral-action-card-illustration') as HTMLElement;
      expect(wrap?.querySelector('img')).toBeNull();
      expect(wrap?.querySelector('i.pi')).not.toBeNull();
    });
  });

  describe('CTA event', () => {
    it('emits ctaClick when the button click handler runs', () => {
      const spy = jest.fn();
      component.ctaClick.subscribe(spy);
      fixture.detectChanges();
      component.onCtaClick();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does NOT emit ctaClick when disabled', () => {
      component.disabled = true;
      const spy = jest.fn();
      component.ctaClick.subscribe(spy);
      fixture.detectChanges();
      component.onCtaClick();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('accessibility (WCAG 2.1 AA — PRD C-4)', () => {
    it('region root has role="region" and aria-labelledby pointing at the title id', () => {
      component.title = 'VIEW HIGH LEVEL OUTPUTS';
      fixture.detectChanges();
      const root = el('bilateral-action-card') as HTMLElement;
      const heading = el('bilateral-action-card-title') as HTMLElement;

      expect(root?.getAttribute('role')).toBe('region');
      expect(root?.getAttribute('aria-labelledby')).toBe(heading?.id);
      expect(heading?.id?.startsWith('bilateral-action-card-title-')).toBe(true);
    });

    it('illustration container is aria-hidden (decorative)', () => {
      fixture.detectChanges();
      expect(el('bilateral-action-card-illustration')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('CTA carries the configured aria-label (describes the action)', () => {
      fixture.detectChanges();
      // Default value documents the action — not the literal label
      expect(component.ctaAriaLabel).toBe('Open High Level Outputs selector');
    });

    it('unique title ids when multiple instances are rendered (no collision)', () => {
      const a = TestBed.createComponent(BilateralActionCardComponent).componentInstance;
      const b = TestBed.createComponent(BilateralActionCardComponent).componentInstance;
      expect(a.titleId).not.toBe(b.titleId);
    });
  });

  describe('mockup-quoted copy (locked literal — Figma `32471:129636`)', () => {
    // Per [`./design.md`](./design.md) and the figma-mockups README, the
    // canonical body text on the bilateral AI card is the literal below.
    // This spec asserts the consumer can wire it without losing characters
    // (the High-Level / hyphens / parentheses are easy to drift on).
    it('renders the canonical bilateral body copy without character drift', () => {
      const canonical =
        'Browse and select the High-Level Outputs associated with this result. ' +
        'You can review their details before linking them to ensure proper alignment and reporting accuracy.';
      component.title = 'VIEW HIGH LEVEL OUTPUTS';
      component.body = canonical;
      fixture.detectChanges();
      expect(el('bilateral-action-card-body')?.textContent?.trim()).toBe(canonical);
    });
  });
});
