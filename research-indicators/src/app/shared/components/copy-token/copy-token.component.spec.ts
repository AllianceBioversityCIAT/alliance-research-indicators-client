import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyTokenComponent } from './copy-token.component';

describe('CopyTokenComponent', () => {
  let component: CopyTokenComponent;
  let fixture: ComponentFixture<CopyTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyTokenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
