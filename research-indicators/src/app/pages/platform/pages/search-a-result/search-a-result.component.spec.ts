import { ComponentFixture, TestBed } from '@angular/core/testing';
import SearchAResultComponent from './search-a-result.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('ResultsExplorerComponent', () => {
  let component: SearchAResultComponent;
  let fixture: ComponentFixture<SearchAResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAResultComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchAResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
