import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const resultInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const shouldUseYear = req.headers.has('X-Use-Year');

  if (!shouldUseYear) {
    return next(req);
  }

  
  const headers = req.headers.delete('X-Use-Year');
  const year = getYearFromUrl(router);
  
  // Check if platform is provided via header, otherwise get from URL
  const platformFromHeader = req.headers.get('X-Platform');
  const platform = platformFromHeader || getPlatformFromUrl(router);


  let modifiedUrl = req.url;

  if (year) {
    modifiedUrl = addParameterToUrl(modifiedUrl, 'reportYear', year);
  }

  if (platform) {
    modifiedUrl = addParameterToUrl(modifiedUrl, 'reportingPlatforms', platform);
  }


  const clonedRequest = req.clone({
    url: modifiedUrl,
    headers
  });

  return next(clonedRequest);
};

function getYearFromUrl(router: Router): string | null {
  const tree = router.parseUrl(router.url);
  return tree.queryParams['version'] ?? null;
}

function getPlatformFromUrl(router: Router): string | null {
  const url = router.url;

  const platformRegex = /result\/(PRMS|STAR|TIP)-(\d+)/;
  const platformMatch = platformRegex.exec(url);
  if (platformMatch) {
    return platformMatch[1];
  }

  const resultRegex = /result\/(\d+)/;
  const resultMatch = resultRegex.exec(url);
  if (resultMatch) {
    return 'STAR';
  }

  return null;
}

function addParameterToUrl(url: string, paramName: string, paramValue: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${paramName}=${paramValue}`;
}
