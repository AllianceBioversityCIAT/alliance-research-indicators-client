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

  it('should set first and rows on page change (with values)', () => {
    component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });

    component.onPageChange({ first: 10, rows: 20 });
    expect(component.allProjectsFirst()).toBe(10);
    expect(component.allProjectsRows()).toBe(20);
  });

  it('should set default values on page change (undefined)', () => {
    component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });

    component.onPageChange({ first: undefined, rows: undefined });
    expect(component.allProjectsFirst()).toBe(0);
    expect(component.allProjectsRows()).toBe(10);
  });

  it('should set first and rows for my projects tab', () => {
    component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });

    component.onPageChange({ first: 15, rows: 25 });
    expect(component.myProjectsFirst()).toBe(15);
    expect(component.myProjectsRows()).toBe(25);
  });
});
