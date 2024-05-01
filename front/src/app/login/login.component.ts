import { Component } from '@angular/core';
import { ApiHelperService } from '../services/api-helper.service';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(

    private api: ApiHelperService,
    private tokenStorageService: TokenStorageService
  ) {
   }
  errorMessage = '';

  login(): void {
    const username: string = (document.getElementById('email') as HTMLInputElement).value;
    const password: string = (document.getElementById('password') as HTMLInputElement).value;
    this.api.post({ endpoint: '/auth/login', data: { username, password } })
      .then(response => {
        this.tokenStorageService.save(response.access_token);
        window.location.href = '/users'; 
     }).catch(error => {
      console.log(error);
      if (error.status === 401) {
        this.errorMessage = 'Wrong email or password';
      }else {
        this.errorMessage = 'An error occurred during login';
      }
    });
  }
}
