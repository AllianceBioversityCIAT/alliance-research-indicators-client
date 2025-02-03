import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalToastComponent } from './global-toast.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GlobalToastComponent', () => {
  let component: GlobalToastComponent;
  let fixture: ComponentFixture<GlobalToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalToastComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
