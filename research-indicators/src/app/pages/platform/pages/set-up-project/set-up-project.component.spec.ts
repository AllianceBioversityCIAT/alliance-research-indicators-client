import { ComponentFixture, TestBed } from '@angular/core/testing';

import SetUpProjectComponent from './set-up-project.component';

describe('SetUpProjectComponent', () => {
  let component: SetUpProjectComponent;
  let fixture: ComponentFixture<SetUpProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetUpProjectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SetUpProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
