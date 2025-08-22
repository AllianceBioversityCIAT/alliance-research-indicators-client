import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableIndicatorItemComponent } from './table-indicator-item.component';

describe('TableIndicatorItemComponent', () => {
  let component: TableIndicatorItemComponent;
  let fixture: ComponentFixture<TableIndicatorItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableIndicatorItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableIndicatorItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
