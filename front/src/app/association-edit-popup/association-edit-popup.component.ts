import { Component, Inject, OnInit } from '@angular/core';
import { Association } from '../associations-list/associations-list.component';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiHelperService } from '../services/api-helper.service';
import { User } from '../users-list/users-list.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-association-edit-popup',
  templateUrl: './association-edit-popup.component.html',
  styleUrls: ['./association-edit-popup.component.css']
})
export class AssociationEditPopupComponent implements OnInit{
  association: Association;
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
    public dialogRef: MatDialogRef<AssociationEditPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { password: string, association: Association },
    private userService: UserService,
    private api: ApiHelperService,
  ){
    this.association = data.association;

    this.name.setValue(this.association.name);
    this.password.setValue(this.data.password);
    this.name.valueChanges.subscribe(() => this.updateErrorMessage('name'));
    this.password.valueChanges.subscribe(() => this.updateErrorMessage('password'));
    this.confirmPassword.valueChanges.subscribe(() => this.updateErrorMessage('confirmPassword'));

  }

  ngOnInit(): void {
    this.fetchUsers();
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
    
    const userIds = usersToAdd.map(({ userId }) => userId).join(',');
    
    const associationData = {
      name: this.name.value,
      userIds: userIds,
      password: this.password.value
    };

    this.api.put({ endpoint: `/associations/${this.association.id}`, data: associationData})
    .then(() => {
      console.log(`Association ${this.association.id} successfully updated`);
      // Send the updated association id and association data back to the parent component
      this.dialogRef.close({ id: this.association.id, name: associationData.name, userIds, password: associationData.password });
    })
    .catch((error) => {
      console.error(error);
    });

  }

  private fetchUsers(): void {
    this.userService.users$.subscribe((users) => {
      this.users = users.map(user => ({
        user,
        addToAssociationControl: new FormControl('')
      }));
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
