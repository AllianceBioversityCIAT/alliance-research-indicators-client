import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import MyProjectsComponent from './my-projects.component';

describe('MyProjectsComponent', () => {
  let component: MyProjectsComponent;
  let fixture: ComponentFixture<MyProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProjectsComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({}) // Mock route parameters if needed
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return all projects when searchValue is empty', () => {
    component.getContractsByUserService.list.set([{ full_name: 'Project A' }, { full_name: 'Project B' }]);
    component.searchValue = '';
    expect(component.filteredProjects().length).toBe(2);
  });

  it('should filter projects by searchValue', () => {
    component.getContractsByUserService.list.set([{ full_name: 'Alpha' }, { full_name: 'Beta' }]);
    component.searchValue = 'alpha';
    expect(component.filteredProjects().length).toBe(1);
    expect(component.filteredProjects()[0].full_name).toBe('Alpha');
  });

  it('should return empty array if no project matches searchValue', () => {
    component.getContractsByUserService.list.set([{ full_name: 'Alpha' }]);
    component.searchValue = 'zzz';
    expect(component.filteredProjects().length).toBe(0);
  });

  it('should set first and rows on page change (with values)', () => {
    component.onPageChange({ first: 10, rows: 20 });
    expect(component.first()).toBe(10);
    expect(component.rows()).toBe(20);
  });

  it('should set default values on page change (undefined)', () => {
    component.onPageChange({ first: undefined, rows: undefined });
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(5);
  });
});
