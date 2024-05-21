import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ApiHelperService } from '../services/api-helper.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  // Define index signature
  [key: string]: any;

  // Define form controls for each input field
  lastname = new FormControl('', [Validators.required]);
  firstname = new FormControl('', [Validators.required]);
  age = new FormControl('', [Validators.required]);
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);
  confirmPassword = new FormControl('', [Validators.required]);
  
  errorMessage: {[key: string]: any}  = { 
    lastname: '',
    firstname: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  constructor(
    private api: ApiHelperService,
  ) {
    this.lastname.valueChanges.subscribe(() => this.updateErrorMessage('lastname'));
    this.firstname.valueChanges.subscribe(() => this.updateErrorMessage('firstname'));
    this.age.valueChanges.subscribe(() => this.updateErrorMessage('age'));
    this.email.valueChanges.subscribe(() => this.updateErrorMessage('email'));
    this.password.valueChanges.subscribe(() => this.updateErrorMessage('password'));
    this.confirmPassword.valueChanges.subscribe(() => this.updateErrorMessage('confirmPassword'));
  }

  onSubmit(): void {
    const userData = {
      firstname: this.firstname.value,
      lastname: this.lastname.value,
      age: this.age.value,
      email: this.email.value,
      password: this.password.value
    };
    this.api.post({ endpoint: '/users', data: userData })
    .then(() => {
      window.location.reload();
    }).catch((error: any) => {
      console.log(error);
    });
  }

  updateErrorMessage(fieldName: string) {
    const control = this[fieldName];
    if (control.invalid && control.dirty) {
      if (control.hasError('required')) {
        this.errorMessage[fieldName] = 'This field is required';
      } else if (control.hasError('email')) {
        this.errorMessage[fieldName] = 'Please enter a valid email';
      } else if (control.hasError('passwordMismatch')) {
        this.errorMessage[fieldName] = 'Passwords do not match';
      }
    } else {
      this.errorMessage[fieldName] = '';
    }
  }
  
}
