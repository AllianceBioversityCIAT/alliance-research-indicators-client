import { Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CognitoService } from '../../../../shared/services/cognito.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner',
  imports: [ButtonModule, RouterLink],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  redirectToCognito = inject(CognitoService).redirectToCognito;
}
