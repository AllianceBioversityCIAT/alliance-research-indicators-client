import { TestBed } from '@angular/core/testing';
import { OpenReplayService } from './open-replay.service';
import TrackerMock from '../../../../tests/mocks/openReplayMock';

jest.mock('@openreplay/tracker', () => {
  return jest.fn().mockImplementation(() => new TrackerMock());
});

describe('OpenReplayService', () => {
  let service: OpenReplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenReplayService]
    });
    service = TestBed.inject(OpenReplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize tracker with project key', () => {
    expect(service.tracker).toBeTruthy();
  });

  it('should call start method on construction', () => {
    const startSpy = jest.spyOn(service, 'start');
    service = new OpenReplayService();
    expect(startSpy).toHaveBeenCalled();
  });

  it('should call tracker.start when start method is called', async () => {
    const trackerStartSpy = jest.spyOn(service.tracker!, 'start');
    await service.start();
    expect(trackerStartSpy).toHaveBeenCalled();
  });
});
