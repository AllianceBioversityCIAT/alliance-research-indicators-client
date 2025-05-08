import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const yearInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const shouldUseYear = req.headers.has('X-Use-Year');

  if (!shouldUseYear) {
    return next(req);
  }

  const headers = req.headers.delete('X-Use-Year');
  const year = getYearFromUrl(router);

  if (!year) {
    return next(req.clone({ headers }));
  }

  const modifiedUrl = addYearToUrl(req.url, year);
  const clonedRequest = req.clone({
    url: modifiedUrl,
    headers
  });

  return next(clonedRequest);
};

// Helpers
function getYearFromUrl(router: Router): string | null {
  const tree = router.parseUrl(router.url);
  return tree.queryParams['version'] ?? null;
}

function addYearToUrl(url: string, year: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}reportYear=${year}`;
}
