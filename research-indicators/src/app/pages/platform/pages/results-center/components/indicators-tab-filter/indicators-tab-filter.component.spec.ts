import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IndicatorsTabFilterComponent } from './indicators-tab-filter.component';

// Mock ResizeObserver
class ResizeObserverMock {
  observe(target: Element) {
    // Mock implementation
    console.log('Mock observe called on:', target);
  }
  unobserve(target: Element) {
    // Mock implementation
    console.log('Mock unobserve called on:', target);
  }
  disconnect() {
    // Mock implementation
    console.log('Mock disconnect called');
  }
}

describe('IndicatorsTabFilterComponent', () => {
  let component: IndicatorsTabFilterComponent;
  let fixture: ComponentFixture<IndicatorsTabFilterComponent>;

  beforeEach(async () => {
    // Add ResizeObserver to the global object
    global.ResizeObserver = ResizeObserverMock;

    await TestBed.configureTestingModule({
      imports: [IndicatorsTabFilterComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicatorsTabFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
