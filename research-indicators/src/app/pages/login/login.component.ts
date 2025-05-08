import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CognitoService } from '../../shared/services/cognito.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  email = '';
  password = '';

  loginWithAzureAd() {
    const loginUrl =
      'https://ost-toc.auth.us-east-1.amazoncognito.com/oauth2/authorize?response_type=code&client_id=633s5bbcklq3bpvnctpnf1e2si&redirect_uri=https%3A%2F%2Fallianceindicatorstest.ciat.cgiar.org%2Fauth&scope=openid+email+profile&identity_provider=CGIAR-AzureAD';

    window.location.href = loginUrl;
  }

  loginWithCredentials() {
    // Implement email/password login logic here
    // Actual authentication code would go here
    if (!this.email || !this.password) {
      // Handle validation error
    }
  }

  forgotPassword() {
    // Implement password recovery logic
    // Password reset functionality would go here
    if (!this.email) {
      // Handle missing email
    }
  }

  signUp() {
    // Navigate to signup page or show signup modal
    // Navigation code would go here
  }
}
