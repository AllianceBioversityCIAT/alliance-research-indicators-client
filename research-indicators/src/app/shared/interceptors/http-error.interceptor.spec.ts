import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ActionsService } from '@services/actions.service';
import { CacheService } from '../services/cache/cache.service';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { httpErrorInterceptor } from './http-error.interceptor';
import { fakeAsync, tick } from '@angular/core/testing';

describe('httpErrorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => TestBed.runInInjectionContext(() => httpErrorInterceptor(req, next));

  let mockActionsService: any;
  let mockCacheService: any;
  let mockApiService: any;
  let mockRouter: any;
  let mockRequest: HttpRequest<any>;
  let mockHandler: HttpHandlerFn;

  beforeEach(() => {
    mockActionsService = {
      showToast: jest.fn()
    };

    mockCacheService = {
      isLoggedIn: jest.fn(),
      dataCache: jest.fn()
    };

    mockApiService = {
      saveErrors: jest.fn()
    };

    mockRouter = {
      url: '/test-route'
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ActionsService, useValue: mockActionsService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    mockRequest = new HttpRequest('GET', 'http://test.com/api/data');
    mockHandler = jest.fn().mockReturnValue(of({}));
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should skip timeout check for error endpoint', () => {
    const errorRequest = new HttpRequest('GET', 'https://ciat-errors.yecksin.workers.dev/error');

    interceptor(errorRequest, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(errorRequest);
  });

  it('should handle successful request without errors', done => {
    const response = { data: 'success' };
    mockHandler = jest.fn().mockReturnValue(of(response));
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: result => {
        expect(result).toEqual(response);
        done();
      },
      error: done.fail
    });
  });

  it('should handle HTTP error and show toast when user is logged in and error is not 409, 401, or refresh-token', fakeAsync(() => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Test error message' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockCacheService.dataCache.mockReturnValue({
      user: {
        sec_user_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com'
      }
    });
    mockApiService.saveErrors.mockResolvedValue(undefined);

    let errorCaught: any;
    interceptor(mockRequest, mockHandler).subscribe({
      next: () => {},
      error: error => {
        errorCaught = error;
      }
    });

    tick();

    expect(errorCaught).toBe(errorResponse);
    expect(mockApiService.saveErrors).toHaveBeenCalled();
    expect(mockActionsService.showToast).toHaveBeenCalledWith({
      detail: 'Test error message',
      severity: 'error',
      summary: 'Error'
    });
  }));

  it('should handle HTTP error but not show toast when user is not logged in', done => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Test error message' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(false);
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalled();
        expect(mockActionsService.showToast).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should handle HTTP error but not show toast when error status is 409', done => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Conflict error' },
      status: 409,
      statusText: 'Conflict'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalled();
        expect(mockActionsService.showToast).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should handle HTTP error but not show toast when error status is 401', done => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Unauthorized error' },
      status: 401,
      statusText: 'Unauthorized'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalled();
        expect(mockActionsService.showToast).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should handle HTTP error but not show toast when request URL includes refresh-token', done => {
    const refreshTokenRequest = new HttpRequest('GET', 'http://test.com/refresh-token');
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Refresh token error' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(refreshTokenRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalled();
        expect(mockActionsService.showToast).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should handle HTTP error with user data when user exists in cache', done => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Test error message' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockCacheService.dataCache.mockReturnValue({
      user: {
        sec_user_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com'
      }
    });
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: '123',
            user_name: 'John Doe',
            user_email: 'john.doe@test.com'
          })
        );
        done();
      }
    });
  });

  it('should handle HTTP error with partial user data when user has only first name', done => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Test error message' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockCacheService.dataCache.mockReturnValue({
      user: {
        sec_user_id: 123,
        first_name: 'John',
        last_name: undefined,
        email: 'john@test.com'
      }
    });
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: '123',
            user_name: 'John',
            user_email: 'john@test.com'
          })
        );
        done();
      }
    });
  });

  it('should handle HTTP error with partial user data when user has only last name', done => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Test error message' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockCacheService.dataCache.mockReturnValue({
      user: {
        sec_user_id: 123,
        first_name: undefined,
        last_name: 'Doe',
        email: 'doe@test.com'
      }
    });
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: '123',
            user_name: 'Doe',
            user_email: 'doe@test.com'
          })
        );
        done();
      }
    });
  });

  it('should handle HTTP error when user data is not available in cache', done => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Test error message' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockCacheService.dataCache.mockReturnValue(null);
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: undefined,
            user_name: '',
            user_email: undefined
          })
        );
        done();
      }
    });
  });

  it('should handle timeout scenario and save pending error', done => {
    mockApiService.saveErrors.mockResolvedValue(undefined);

    const subscription = interceptor(mockRequest, mockHandler).subscribe({
      next: result => {
        expect(result).toEqual({});
        done();
      },
      error: done.fail
    });

    // The timeout check runs in parallel, so we need to wait for it
    setTimeout(() => {
      expect(mockApiService.saveErrors).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          message: 'Request is taking longer than 5 seconds to respond'
        })
      );
      subscription.unsubscribe();
      done();
    }, 100);
  });

  it('should create error object with correct properties', done => {
    const errorResponse = new HttpErrorResponse({
      error: { errors: 'Test error message' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    mockHandler = jest.fn().mockReturnValue(throwError(() => errorResponse));
    mockCacheService.isLoggedIn.mockReturnValue(true);
    mockCacheService.dataCache.mockReturnValue({
      user: {
        sec_user_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com'
      }
    });
    mockApiService.saveErrors.mockResolvedValue(undefined);

    interceptor(mockRequest, mockHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error).toBe(errorResponse);
        expect(mockApiService.saveErrors).toHaveBeenCalledWith(
          expect.objectContaining({
            path: 'http://test.com/api/data',
            current_route: '/test-route',
            domain: window.location.hostname,
            status: 'error',
            original_error: errorResponse,
            user_id: '123',
            user_name: 'John Doe',
            user_email: 'john.doe@test.com'
          })
        );
        done();
      }
    });
  });
});
