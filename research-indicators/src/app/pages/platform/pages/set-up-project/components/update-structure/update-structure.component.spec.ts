import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateStructureComponent } from './update-structure.component';

describe('UpdateStructureComponent', () => {
  let component: UpdateStructureComponent;
  let fixture: ComponentFixture<UpdateStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateStructureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
