import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainActionsComponent } from './main-actions.component';

describe('MainActionsComponent', () => {
  let component: MainActionsComponent;
  let fixture: ComponentFixture<MainActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
