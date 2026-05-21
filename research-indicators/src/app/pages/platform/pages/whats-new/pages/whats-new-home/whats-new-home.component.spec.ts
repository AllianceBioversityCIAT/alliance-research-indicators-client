import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import WhatsNewHomeComponent from './whats-new-home.component';
import { WhatsNewService } from '../../services/whats-new.service';

describe('WhatsNewHomeComponent', () => {
  let fixture: ComponentFixture<WhatsNewHomeComponent>;
  let whatsNewService: {
    notionDataLoading: ReturnType<typeof signal<boolean>>;
    notionData: ReturnType<typeof signal<{ results: unknown[] } | null>>;
    isReleaseNoteNew: jest.Mock;
    getDisplayDate: jest.Mock;
    getColor: jest.Mock;
  };

  beforeEach(async () => {
    whatsNewService = {
      notionDataLoading: signal(false),
      notionData: signal({ results: [] }),
      isReleaseNoteNew: jest.fn().mockReturnValue(false),
      getDisplayDate: jest.fn().mockReturnValue('2026-05-06T00:00:00.000Z'),
      getColor: jest.fn().mockReturnValue('#2F5168')
    };

    await TestBed.configureTestingModule({
      imports: [WhatsNewHomeComponent, RouterTestingModule],
      providers: [{ provide: WhatsNewService, useValue: whatsNewService }]
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsNewHomeComponent);
  });

  it('should create and show empty state', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No published release notes');
  });

  it('should show loading skeletons', () => {
    whatsNewService.notionDataLoading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-skeleton')).toBeTruthy();
  });

  it('should render release note cards', () => {
    whatsNewService.notionData.set({
      results: [
        {
          id: 'page-1',
          properties: { Name: { title: [{ plain_text: 'Hello' }] } }
        }
      ]
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-release-note-card')).toBeTruthy();
  });
});
