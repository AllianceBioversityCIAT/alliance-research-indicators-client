import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagComponent } from './custom-tag.component';

describe('CustomTagComponent', () => {
  let component: CustomTagComponent;
  let fixture: ComponentFixture<CustomTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomTagComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomTagComponent);
    component = fixture.componentInstance;
    component.border = '1px solid black'; // Ajusta según sea necesario
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
