import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProjectResultsTableService } from './project-results-table.service';
import { ApiService } from '../../services/api.service';

describe('ProjectResultsTableService', () => {
  let service: ProjectResultsTableService;
  let mockApiService: jest.Mocked<ApiService>;

  beforeEach(() => {
    const apiSpy = {
      GET_ResultsByContractId: jest.fn().mockResolvedValue({
        data: []
      })
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiSpy }
      ]
    });
    service = TestBed.inject(ProjectResultsTableService);
    mockApiService = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
