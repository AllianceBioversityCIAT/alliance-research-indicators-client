import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { AllianceAlignmentPortfolioComponent } from './alliance-alignment-portfolio.component';

describe('AllianceAlignmentPortfolioComponent', () => {
  let fixture: ComponentFixture<AllianceAlignmentPortfolioComponent>;
  let component: AllianceAlignmentPortfolioComponent;
  let metadata = signal<Record<string, unknown>>({ indicator_id: 5 });

  beforeEach(async () => {
    metadata = signal<Record<string, unknown>>({ indicator_id: 5 });
    await TestBed.configureTestingModule({
      imports: [AllianceAlignmentPortfolioComponent],
      providers: [
        { provide: CacheService, useValue: { currentMetadata: () => metadata() } },
        { provide: SubmissionService, useValue: { isEditableStatus: jest.fn().mockReturnValue(true) } }
      ]
    })
      .overrideComponent(AllianceAlignmentPortfolioComponent, {
        set: {
          imports: [],
          template: `
            <span>Research Areas</span>
            <span>Strategic Objectives</span>
            @if (shouldShowImpactOutcomes()) {
              <span>Impact Outcomes</span>
            }
          `
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AllianceAlignmentPortfolioComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('body', signal({ contracts: [], result_sdgs: [], primary_levers: [], contributor_levers: [] }));
    fixture.detectChanges();
  });

  it('should render portfolio fields for OICR', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Research Areas');
    expect(text).toContain('Strategic Objectives');
    expect(text).toContain('Impact Outcomes');
  });

  it('should render impact outcomes for Policy Change and Investments', () => {
    metadata.set({ indicator_id: 4 });
    fixture.detectChanges();
    expect(component.shouldShowImpactOutcomes()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Impact Outcomes');
  });

  it('should hide impact outcomes for non-OICR and non-Policy Change indicators', () => {
    metadata.set({ indicator_id: 1 });
    fixture.detectChanges();
    expect(component.shouldShowImpactOutcomes()).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Impact Outcomes');
  });

  it('should filter control list rows by type text', () => {
    expect(component.researchAreaFilter({ id: 1, name: 'Research Area 1' } as any)).toBe(true);
    expect(component.strategicObjectiveFilter({ id: 2, type: 'strategic_objective', name: 'SO1' } as any)).toBe(true);
    expect(component.impactOutcomeFilter({ id: 3, category: 'impact-outcome', name: 'IO1' } as any)).toBe(true);
    expect(component.researchAreaFilter({ id: 4, name: 'Lever 1' } as any)).toBe(false);
  });
});
