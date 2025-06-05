import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ApiService } from '@shared/services/api.service';
import { ElementRef } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let apiMock: Partial<ApiService>;

  beforeEach(waitForAsync(() => {
    apiMock = {
      GET_AnnouncementSettingAvailable: jest.fn().mockResolvedValue({
        data: [{
          title: 'Test Title',
          description: 'Test Description'
        }]
      })
    };

    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: ApiService, useValue: apiMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null message', () => {
    expect(component.message()).toBeNull();
  });

  it('should load announcement message on init', async () => {
    fixture.detectChanges();
    await component.main();
    expect(component.message()).toEqual({
      title: 'Test Title',
      description: 'Test Description'
    });
  });

  it('should handle mouse move event', () => {
    const mockElement = {
      style: {
        transform: ''
      },
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100
      })
    };

    component.tiltBox = { nativeElement: mockElement } as ElementRef;
    
    const mockEvent = {
      clientX: 50,
      clientY: 50
    } as MouseEvent;

    component.onMouseMove(mockEvent);
    expect(mockElement.style.transform).toBe('rotateX(0deg) rotateY(0deg)');
  });

  it('should reset transform on mouse leave', () => {
    const mockElement = {
      style: {
        transform: 'rotateX(10deg) rotateY(10deg)'
      }
    };

    component.tiltBox = { nativeElement: mockElement } as ElementRef;
    component.onMouseLeave();
    expect(mockElement.style.transform).toBe('rotateX(0deg) rotateY(0deg)');
  });

  it('should render message content in template', async () => {
    fixture.detectChanges();
    await component.main();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('.title');
    const descriptionElement = compiled.querySelector('.description');

    expect(titleElement.textContent).toContain('Test Title');
    expect(descriptionElement.textContent).toContain('Test Description');
  });

  it('should handle API error gracefully', async () => {
    (apiMock.GET_AnnouncementSettingAvailable as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    await component.main();
    expect(component.message()).toBeNull();
  });
});
