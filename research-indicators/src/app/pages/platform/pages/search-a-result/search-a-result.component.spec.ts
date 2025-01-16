import { ComponentFixture, TestBed } from '@angular/core/testing';

import ResultsExplorerComponent from './search-a-result.component';

describe('ResultsExplorerComponent', () => {
  let component: ResultsExplorerComponent;
  let fixture: ComponentFixture<ResultsExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsExplorerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
