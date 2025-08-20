import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOicrResultComponent } from './create-oicr-result.component';

describe('CreateOicrResultComponent', () => {
  let component: CreateOicrResultComponent;
  let fixture: ComponentFixture<CreateOicrResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOicrResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOicrResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
