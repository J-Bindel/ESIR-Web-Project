import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../users-list/users-list.component';
import { ApiHelperService } from '../services/api-helper.service';

@Component({
  selector: 'app-user-edit-popup',
  templateUrl: './user-edit-popup.component.html',
  styleUrls: ['./user-edit-popup.component.css']
})
export class UserEditPopupComponent {
  user: User;

  // Define index signature
  [key: string]: any;

  // Define form controls for each input field
  lastname = new FormControl('', [Validators.required]);
  firstname = new FormControl('', [Validators.required]);
  age = new FormControl('', [Validators.required]);
  email = new FormControl('', [Validators.required, Validators.email]);

  errorMessage: {[key: string]: any}  = { 
    lastname: '',
    firstname: '',
    age: '',
    email: '',
  };
  
  constructor(
    public dialogRef: MatDialogRef<UserEditPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { password: string, user: User },
    private api: ApiHelperService,
  ) {
    this.user = data.user;

    this.lastname.setValue(this.user.lastname);
    this.firstname.setValue(this.user.firstname);
    this.age.setValue(this.user.age.toString());
    this.email.setValue(this.user.email);

    this.lastname.valueChanges.subscribe(() => this.updateErrorMessage('lastname'));
    this.firstname.valueChanges.subscribe(() => this.updateErrorMessage('firstname'));
    this.age.valueChanges.subscribe(() => this.updateErrorMessage('age'));
    this.email.valueChanges.subscribe(() => this.updateErrorMessage('email'));
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const userData = {
      firstname: this.firstname.value,
      lastname: this.lastname.value,
      age: this.age.value,
      email: this.email.value,
      password: this.data.password
  };
    this.api.put({ endpoint: `/users/${this.user.id}`, data: userData })
    .then(() => 
      { console.log(`User ${this.user.id} updated successfully`);
        this.dialogRef.close();
        window.location.href = '/users';
    }).catch(error => {
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
      }
    } else {
      this.errorMessage[fieldName] = '';
    }
  }

}