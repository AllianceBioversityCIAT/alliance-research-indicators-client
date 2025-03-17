import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SectionSidebarComponent } from './section-sidebar.component';

describe('SectionSidebarComponent', () => {
  let component: SectionSidebarComponent;
  let fixture: ComponentFixture<SectionSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionSidebarComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SectionSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
