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
});
