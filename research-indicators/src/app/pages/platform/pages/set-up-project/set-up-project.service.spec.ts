import { TestBed } from '@angular/core/testing';
import { SetUpProjectService } from './set-up-project.service';
import { ApiService } from '../../../../shared/services/api.service';

describe('SetUpProjectService', () => {
  let service: SetUpProjectService;
  let apiServiceMock: Partial<ApiService>;

  beforeEach(() => {
    apiServiceMock = {
      GET_Structures: jest.fn().mockResolvedValue({ data: { structures: [] }, successfulRequest: true }),
      GET_Indicators: jest.fn().mockResolvedValue({ data: [], successfulRequest: true })
    } as unknown as ApiService;

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: apiServiceMock }]
    });
    service = TestBed.inject(SetUpProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
