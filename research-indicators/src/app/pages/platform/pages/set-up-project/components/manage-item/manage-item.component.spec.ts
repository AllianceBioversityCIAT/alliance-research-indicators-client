import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageItemComponent } from './manage-item.component';

describe('ManageItemComponent', () => {
  let component: ManageItemComponent;
  let fixture: ComponentFixture<ManageItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
