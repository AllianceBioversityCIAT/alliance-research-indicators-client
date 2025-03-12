import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitResultContentComponent } from './submit-result-content.component';

describe('SubmitResultContentComponent', () => {
  let component: SubmitResultContentComponent;
  let fixture: ComponentFixture<SubmitResultContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitResultContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitResultContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
