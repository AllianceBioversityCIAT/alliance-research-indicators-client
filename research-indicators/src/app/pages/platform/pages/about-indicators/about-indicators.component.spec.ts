import { ComponentFixture, TestBed } from '@angular/core/testing';

import AboutIndicatorsComponent from './about-indicators.component';

describe('AboutIndicatorsComponent', () => {
  let component: AboutIndicatorsComponent;
  let fixture: ComponentFixture<AboutIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutIndicatorsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
