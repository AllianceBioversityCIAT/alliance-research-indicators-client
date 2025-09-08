import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressDetailContentComponent } from './progress-detail-content.component';

describe('ProgressDetailContentComponent', () => {
  let component: ProgressDetailContentComponent;
  let fixture: ComponentFixture<ProgressDetailContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressDetailContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressDetailContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
