import { Component, OnInit } from '@angular/core';
import { User } from '../users-list/users-list.component';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../user.service';
import { ApiHelperService } from '../services/api-helper.service';

@Component({
  selector: 'app-association-create-popup',
  templateUrl: './association-create-popup.component.html',
  styleUrls: ['./association-create-popup.component.css']
})
export class AssociationCreatePopupComponent implements OnInit{
  users: { user: User, addToAssociationControl:  FormControl }[] = [];

  // Define index signature
  [key: string]: any;

  // Define form controls for each input field
  name = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  confirmPassword = new FormControl('', [Validators.required]);
  
  errorMessage: {[key: string]: any}  = { 
    name: '',
    users: '',
    password: '',
    confirmPassword: '',
  };

  constructor(
    public dialogRef: MatDialogRef<AssociationCreatePopupComponent>,
    private userService: UserService,
    private api: ApiHelperService,
  ){
    this.name.valueChanges.subscribe(() => this.updateErrorMessage('name'));
    this.password.valueChanges.subscribe(() => this.updateErrorMessage('password'));
    this.confirmPassword.valueChanges.subscribe(() => this.updateErrorMessage('confirmPassword'));
  }

  ngOnInit(): void {
    this.userService.users$.subscribe((users => {
      users.map(user => ({
        user,
        addToGroupControl: new FormControl('')
      }))
    }));
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const usersToAdd = this.users
    .filter(userAssociation => userAssociation.addToAssociationControl.value === 'Yes')
    .map(userAssociation => ({
      userId: userAssociation.user.id,
      addToAssociation: userAssociation.addToAssociationControl.value
    }));

    // Retrieve the users' names
    const userNamesToAdd = usersToAdd.map(({ userId }) => {
      const user = this.users.find(userGroup => userGroup.user.id === userId);
      return user ? `${user.user.firstname} ${user.user.lastname}` : '';
    });
    
    const associationData = {
      name: this.name.value,
      userIds: usersToAdd.map(user => user.userId),
      usersName: userNamesToAdd,
      password: this.password.value
    };

    this.api.post({ endpoint: '/associations', data: associationData })
    .then(() => {
      console.log('Association created successfully');
      this.dialogRef.close();
      window.location.reload();
    })
    .catch((error) => {
      console.error(error);
    });
  }

  updateErrorMessage(fieldName: string) {
    const control = this[fieldName];
    this.errorMessage[fieldName] = '';
    if (control.invalid && control.dirty) {      
      if (control.hasError('required')) {
        this.errorMessage[fieldName] = 'This field is required';
      } else if (control.hasError('passwordMismatch')) {
        this.errorMessage[fieldName] = 'Passwords do not match';
      }
    } else {
      this.errorMessage[fieldName] = '';
    }
  }
  
}
