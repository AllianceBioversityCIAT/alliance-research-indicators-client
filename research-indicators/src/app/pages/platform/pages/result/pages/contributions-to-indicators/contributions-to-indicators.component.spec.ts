import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributionsToIndicatorsComponent } from './contributions-to-indicators.component';

describe('ContributionsToIndicatorsComponent', () => {
  let component: ContributionsToIndicatorsComponent;
  let fixture: ComponentFixture<ContributionsToIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributionsToIndicatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContributionsToIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
