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
    private tokenStorageService: TokenStorageService,
  ) {
   }
  email: string = '';
  password: string = '';
  errorMessage = '';

  login(): void {

    // Reset error message
    this.errorMessage = '';

    // Check if email and password are empty
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    // Check if email is invalid
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.api.post({ endpoint: '/auth/login', data: { username: this.email, password: this.password } })
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

  // Function to validate email format
  isValidEmail(email: string): boolean {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

}
