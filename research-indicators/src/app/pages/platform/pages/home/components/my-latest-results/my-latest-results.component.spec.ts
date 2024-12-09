import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLatestResultsComponent } from './my-latest-results.component';

describe('MyLatestResultsComponent', () => {
  let component: MyLatestResultsComponent;
  let fixture: ComponentFixture<MyLatestResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyLatestResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyLatestResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
