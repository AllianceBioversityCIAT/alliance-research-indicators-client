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
