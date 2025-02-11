import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableConfigurationComponent } from './table-configuration.component';

describe('TableConfigurationComponent', () => {
  let component: TableConfigurationComponent;
  let fixture: ComponentFixture<TableConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
