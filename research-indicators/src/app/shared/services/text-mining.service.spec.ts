import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TextMiningService } from './text-mining.service';
import { cacheServiceMock } from 'src/app/testing/mock-services.mock';
import { environment } from '@envs/environment';

describe('TextMiningService', () => {
  let service: TextMiningService;
  let httpClientMock: any;

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [TextMiningService, { provide: HttpClient, useValue: httpClientMock }, { provide: 'CacheService', useValue: cacheServiceMock }]
    });
    service = TestBed.inject(TextMiningService);
    service.cache = cacheServiceMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('executeTextMining should return response on success', async () => {
    const mockResponse = { content: [{ type: 'test', text: 'ok' }] };
    httpClientMock.post.mockReturnValue(of(mockResponse));
    const res = await service.executeTextMining('doc.pdf');
    expect(res).toEqual(mockResponse);
    expect(httpClientMock.post).toHaveBeenCalledWith(
      `${environment.textMiningUrl}/process`,
      expect.any(FormData),
      expect.objectContaining({ headers: expect.anything() })
    );
  });

  it('executeTextMining should throw error on failure', async () => {
    httpClientMock.post.mockReturnValue(throwError(() => new Error('fail')));
    await expect(service.executeTextMining('doc.pdf')).rejects.toThrow('fail');
  });
});
