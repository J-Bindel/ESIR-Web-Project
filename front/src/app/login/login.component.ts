import { Component } from '@angular/core';
import { ApiHelperService } from '../services/api-helper.service';
import { TokenStorageService } from '../services/token-storage.service';
import { FormsModule } from '@angular/forms';

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
  email: string = '';
  showPasswordInput: boolean = false;
  errorMessage = '';

  login(): void {
    const username: string = (document.getElementById('username') as HTMLInputElement).value;
    const password: string = (document.getElementById('password') as HTMLInputElement).value;
    this.api.post({ endpoint: '/auth/login', data: { username, password } }).then(response => {
      this.tokenStorageService.save(response.access_token);
      
      if (this.tokenStorageService.isLogged()) {
        window.location.href = '/users';
      }else{
        this.errorMessage = 'Wrong username or password';
      }
    }
    ).catch(error => {
      console.log(error);
      this.errorMessage = 'An error occurred during login';
    });
  }

  showPassword() {
    if (this.email.trim() !== '') {
      this.showPasswordInput = true;
    }
  }
}
