import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedResultFormComponent } from './shared-result-form.component';

describe('SharedResultFormComponent', () => {
  let component: SharedResultFormComponent;
  let fixture: ComponentFixture<SharedResultFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedResultFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedResultFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
