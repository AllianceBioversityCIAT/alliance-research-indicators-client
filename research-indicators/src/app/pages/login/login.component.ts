import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CognitoService } from '../../shared/services/cognito.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ActionsService } from '../../shared/services/actions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export default class LoginComponent {
  cognito = inject(CognitoService);
  actions = inject(ActionsService);
  router = inject(Router);
  body = signal<{ email: string; password: string }>({
    email: '',
    password: ''
  });

  loginWithAzureAd() {
    window.location.href =
      `${environment.cognitoDomain}oauth2/authorize` +
      `?response_type=code` +
      `&client_id=${environment.cognitoClientId}` +
      `&redirect_uri=${environment.cognitoRedirectUri}` +
      `&scope=openid+email+profile` +
      `&identity_provider=${environment.cognitoIdentityProvider}`;
  }

  async loginWithCredentials() {
    if (!this.body().email || !this.body().password) {
      this.actions.showToast({
        severity: 'error',
        summary: 'Invalid credentials',
        detail: 'Please fill all the fields'
      });
      return;
    }

    const url = `${environment.cognitoDomain}oauth2/token`;

    const auth = btoa(`${environment.cognitoClientId}:${environment.cognitoClientSecret}`);

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      username: this.body().email,
      password: this.body().password,
      scope: 'openid email profile phone'
    });

    const response = await fetch(url, {
      method: 'POST',
      body: body.toString(),
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    console.error(data);

    if (data.access_token) {
      this.actions.updateLocalStorage(data);
      this.router.navigate(['/']);
    } else {
      this.actions.showToast({
        severity: 'error',
        summary: 'Invalid credentials',
        detail: 'Please fill all the fields'
      });
    }
  }
}
