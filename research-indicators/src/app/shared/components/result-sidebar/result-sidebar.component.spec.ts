import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ResultSidebarComponent } from './result-sidebar.component';

describe('ResultSidebarComponent', () => {
  let component: ResultSidebarComponent;
  let fixture: ComponentFixture<ResultSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, ResultSidebarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
