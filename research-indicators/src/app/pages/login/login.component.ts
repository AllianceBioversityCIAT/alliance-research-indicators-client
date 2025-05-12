import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CognitoService } from '../../shared/services/cognito.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ActionsService } from '../../shared/services/actions.service';
import { Router } from '@angular/router';

interface UserData {
  Username: string;
  UserAttributes: { Name: string; Value: string }[];
  [key: string]: string | { Name: string; Value: string }[] | unknown;
}

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
  isLoading = signal<boolean>(false);
  userData = signal<UserData | null>(null);

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

    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);

    // try {
    //   const authData = {
    //     AuthFlow: 'USER_PASSWORD_AUTH',
    //     AuthParameters: {
    //       USERNAME: this.body().email,
    //       PASSWORD: this.body().password,
    //       SECRET_HASH: 'qVpW1g3NfOt1Cnrm6QyxV4ONBgYUAWa8cHG2hpIFAY4='
    //     },
    //     ClientId: environment.cognitoClientLoginId
    //   };

    //   const url = `https://cognito-idp.us-east-1.amazonaws.com/`;

    //   // Make the API call to Cognito
    //   const response = await fetch(url, {
    //     method: 'POST',
    //     headers: {
    //       'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
    //       'Content-Type': 'application/x-amz-json-1.1'
    //     },
    //     body: JSON.stringify(authData)
    //   });

    //   const data = await response.json();

    //   if (data.AuthenticationResult) {
    //     // Authentication successful
    //     const { AccessToken } = data.AuthenticationResult;

    //     console.log('data', data);

    //     // Get user data after successful login
    //     const user = await this.getUserData(AccessToken);
    //     console.log(user);
    //     // if (user) {
    //     //   this.router.navigate(['/auth'], { queryParams: { code: user?.Username } });
    //     // }
    //   } else if (data.ChallengeName) {
    //     // Handle different challenges like NEW_PASSWORD_REQUIRED
    //     this.actions.showToast({
    //       severity: 'warning',
    //       summary: 'Additional verification required',
    //       detail: `Challenge: ${data.ChallengeName}`
    //     });
    //   } else {
    //     throw new Error(data.message || 'Authentication failed');
    //   }
    // } catch (error) {
    //   console.error('Authentication error:', error);
    //   this.actions.showToast({
    //     severity: 'error',
    //     summary: 'Login failed',
    //     detail: error instanceof Error ? error.message : 'Unknown error occurred'
    //   });
    // } finally {
    //   this.isLoading.set(false);
    // }
  }

  // async getUserData(accessToken: string) {
  //   try {
  //     const url = `https://cognito-idp.us-east-1.amazonaws.com`;

  //     const response = await fetch(url, {
  //       method: 'POST',
  //       headers: {
  //         'X-Amz-Target': 'AWSCognitoIdentityProviderService.GetUser',
  //         'Content-Type': 'application/x-amz-json-1.1'
  //       },
  //       body: JSON.stringify({
  //         AccessToken: accessToken
  //       })
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to get user data: ${response.status}`);
  //     }

  //     const userData = await response.json();
  //     this.userData.set(userData);

  //     return userData;
  //   } catch (error) {
  //     console.error('Error getting user data:', error);
  //     this.actions.showToast({
  //       severity: 'error',
  //       summary: 'Failed to get user data',
  //       detail: error instanceof Error ? error.message : 'Unknown error occurred'
  //     });
  //     return null;
  //   }
  // }
}
