import { Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CognitoService } from '../../../../shared/services/cognito.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  redirectToCognito = inject(CognitoService).redirectToCognito;
}
