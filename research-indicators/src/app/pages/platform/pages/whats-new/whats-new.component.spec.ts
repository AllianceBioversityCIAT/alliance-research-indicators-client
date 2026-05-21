import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import WhatsNewComponent from './whats-new.component';
import { WhatsNewService } from './services/whats-new.service';

describe('WhatsNewComponent', () => {
  let whatsNewService: { getWhatsNewPages: jest.Mock; markWhatsNewAsSeen: jest.Mock };

  beforeEach(async () => {
    whatsNewService = {
      getWhatsNewPages: jest.fn(),
      markWhatsNewAsSeen: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [WhatsNewComponent, RouterTestingModule],
      providers: [{ provide: WhatsNewService, useValue: whatsNewService }]
    }).compileComponents();
  });

  it('should call getWhatsNewPages and markWhatsNewAsSeen on init', () => {
    const fixture = TestBed.createComponent(WhatsNewComponent);
    fixture.detectChanges();
    expect(whatsNewService.getWhatsNewPages).toHaveBeenCalled();
    expect(whatsNewService.markWhatsNewAsSeen).toHaveBeenCalled();
  });
});
