import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CognitoService } from '../../shared/services/cognito.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export default class LoginComponent {
  cognito = inject(CognitoService);
}
