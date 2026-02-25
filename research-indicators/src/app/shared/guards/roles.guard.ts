import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';

export const rolesGuard: CanMatchFn = (route, segments) => {
  const cache = inject(CacheService);
  const router = inject(Router);
  const isLoggedIn = cache.isLoggedIn();
  const routeRequiresLoggedIn = (route.data as { isLoggedIn?: boolean })?.isLoggedIn === true;

  if (!isLoggedIn && routeRequiresLoggedIn) {
    const pathFromSegments = segments.length ? '/' + segments.map(s => s.path).join('/') : '';
    const returnUrl = pathFromSegments || router.url || '/';
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  return isLoggedIn === (route.data as { isLoggedIn?: boolean })?.isLoggedIn || false;
};
