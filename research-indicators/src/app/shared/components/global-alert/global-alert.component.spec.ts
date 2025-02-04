import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GlobalAlertComponent } from './global-alert.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GlobalAlertComponent', () => {
  let component: GlobalAlertComponent;
  let fixture: ComponentFixture<GlobalAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, GlobalAlertComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
