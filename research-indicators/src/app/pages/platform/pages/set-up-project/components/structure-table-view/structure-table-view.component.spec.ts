import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureTableViewComponent } from './structure-table-view.component';

describe('StructureTableViewComponent', () => {
  let component: StructureTableViewComponent;
  let fixture: ComponentFixture<StructureTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureTableViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
