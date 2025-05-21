import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CognitoService } from '../../shared/services/cognito.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export default class LoginComponent {
  cognito = inject(CognitoService);
}
