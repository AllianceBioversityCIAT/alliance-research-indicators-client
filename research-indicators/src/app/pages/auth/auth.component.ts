import { Component, inject, OnInit } from '@angular/core';
import { CognitoService } from '../../shared/services/cognito.service';

@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.component.html'
})
export default class AuthComponent implements OnInit {
  cognito = inject(CognitoService);
  ngOnInit(): void {
    this.cognito.validateCognitoCode();
  }
}
