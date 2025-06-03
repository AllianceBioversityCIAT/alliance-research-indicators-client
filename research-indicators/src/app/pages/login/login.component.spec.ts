import { ComponentFixture, TestBed } from '@angular/core/testing';

import LoginComponent from './login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to home if user is logged in', () => {
      jest.spyOn(router, 'navigate');
      jest.spyOn(component.cache, 'isLoggedIn').mockReturnValue(true);
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
