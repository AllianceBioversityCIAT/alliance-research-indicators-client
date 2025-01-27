import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableFiltersSidebarComponent } from './table-filters-sidebar.component';

describe('TableFiltersSidebarComponent', () => {
  let component: TableFiltersSidebarComponent;
  let fixture: ComponentFixture<TableFiltersSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableFiltersSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableFiltersSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
