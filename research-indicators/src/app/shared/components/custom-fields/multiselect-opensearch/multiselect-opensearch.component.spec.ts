import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectOpensearchComponent } from './multiselect-opensearch.component';

describe('MultiselectOpensearchComponent', () => {
  let component: MultiselectOpensearchComponent;
  let fixture: ComponentFixture<MultiselectOpensearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectOpensearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiselectOpensearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
