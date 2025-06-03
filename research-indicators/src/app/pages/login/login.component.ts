import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CognitoService } from '../../shared/services/cognito.service';
import { Router, RouterLink } from '@angular/router';
import { CacheService } from '../../shared/services/cache/cache.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export default class LoginComponent implements OnInit {
  cognito = inject(CognitoService);
  cache = inject(CacheService);
  router = inject(Router);

  ngOnInit() {
    if (this.cache.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }
}
