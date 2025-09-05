import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ProjectResultsTableComponent } from './project-results-table.component';

describe('ProjectResultsTableComponent', () => {
  let component: ProjectResultsTableComponent;
  let fixture: ComponentFixture<ProjectResultsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectResultsTableComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
