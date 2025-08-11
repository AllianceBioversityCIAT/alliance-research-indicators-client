import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

/**
 * Guard that allows access only when localStorage contains the flag 'onlyMvpUsers' set to 'true'.
 * If the flag is missing, user is redirected to 'home'.
 */
export const mvpGuard: CanMatchFn = () => {
  const flag = typeof localStorage !== 'undefined' ? localStorage.getItem('onlyMvpUsers') : null;
  const isAllowed = flag === 'true';

  if (isAllowed) return true;

  const router = inject(Router);
  router.navigate(['/home']);
  return false;
};
