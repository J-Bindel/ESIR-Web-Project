import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ApiHelperService } from '../services/api-helper.service';
import { User } from '../users-list/users-list.component';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PasswordPromptComponent } from '../password-prompt/password-prompt.component';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  // Define index signature
  [key: string]: any;

  // Define form controls for each input field
  lastname = new FormControl('', [Validators.required]);
  firstname = new FormControl('', [Validators.required]);
  age = new FormControl('', [Validators.required]);
  email = new FormControl('', [Validators.required, Validators.email]);
  confirmEmail = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);
  confirmPassword = new FormControl('', [Validators.required]);
  
  errorMessage: {[key: string]: any}  = { 
    lastname: '',
    firstname: '',
    age: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
  };

  @ViewChild('emailPanel') emailPanel: MatExpansionPanel;
  @ViewChild('passwordPanel') passwordPanel: MatExpansionPanel;

  constructor(
    private userService: UserService,
    private api: ApiHelperService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.userService.loggedInUser$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.lastname.setValue(this.user.lastname);
        this.firstname.setValue(this.user.firstname);
        this.age.setValue(this.user.age.toString());
        this.email.setValue(this.user.email);
        this.confirmEmail.setValue(this.user.email);
      }
    });

    this.lastname.valueChanges.subscribe(() => this.updateErrorMessage('lastname'));
    this.firstname.valueChanges.subscribe(() => this.updateErrorMessage('firstname'));
    this.age.valueChanges.subscribe(() => this.updateErrorMessage('age'));
    this.email.valueChanges.subscribe(() => {
      // Reset confirmEmail when email changes
      this.confirmEmail.setValue('');
      this.updateErrorMessage('email');
    });
    this.password.valueChanges.subscribe(() => this.updateErrorMessage('password'));
    this.confirmPassword.valueChanges.subscribe(() => this.updateErrorMessage('confirmPassword'));
  }

  onSubmit(): void {
    // Block form submission if email and confirm email do not match
    if (this.email.value !== this.confirmEmail.value) {
      return;
    }
    if (this.password.value !== this.confirmPassword.value) {
      return;
    }
    if (this.user) {
      const updatedUser: User = {
        ...this.user,
        firstname: this.firstname.value || '',
        lastname: this.lastname.value || '',
        age: parseInt(this.age.value || '0', 10),
        email: this.email.value || '',
        password: this.password.value || ''
      };
      this.api.put({ endpoint: `/users/${this.user.id}`, data: updatedUser })
      .then(() => {
        this.userService.setLoggedInUser(updatedUser);
        window.location.reload();
      }).catch((error: any) => {
        console.log(error);
      });
    }
  }

  async openPasswordPrompt(group: 'email' | 'password'): Promise<void> {
    const dialogRef = this.dialog.open(PasswordPromptComponent);
    dialogRef.afterClosed().subscribe(async (password: any) => {
      if (password) {
        try {
          const isPasswordCorrect = await this.verifyPassword(password);
          if (isPasswordCorrect) {
            if (group === 'email') {
              this.email.enable();
              this.confirmEmail.enable();
            } else if (group === 'password') {
              this.password.enable();
              this.confirmPassword.enable();
            }
          } else {
            this.showSnackBar('Incorrect password. Please try again.');
          }
        } catch (error) {
          console.error(error);
        }
      }
      if (group === 'email') {
        this.emailPanel.close();
      } else if (group === 'password') {
        this.passwordPanel.close();
      }
    });
  }

  async verifyPassword(password: string): Promise<boolean> {
    if (this.user && this.user.email) {
      try {
        const response = await this.api.post({ endpoint: '/auth/user/login', data: { username: this.user.email, password: password } });
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      console.log("User is not logged in or email is null.");
      return false;
    }
  }

  showSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
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
