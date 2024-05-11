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
  users: User[] = [];

  // Define index signature
  [key: string]: any;

  // Define form controls for each input field
  name = new FormControl('', [Validators.required]);
  userControls: FormControl[] = [];
  password = new FormControl('', [Validators.required]);
  
  errorMessage: {[key: string]: any}  = { 
    name: '',
    users: '',
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

  }

    ngOnInit(): void {
        this.userService.users$.subscribe((users => {
          this.users = users;
        }));
        this.association.usersId.forEach((userId) => {
          const userControl = new FormControl(this.isUserInAssociation(userId));
          this.userControls.push(userControl);
        });
    }

  isUserInAssociation(userId: string): boolean {
    return this.association.usersId.includes(userId);
  }
  
  close(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const usersToAdd = this.userControls
    .map((control, index) => ({
      userId: this.users[index].id,
      addToAssociation: control.value
    }))
    .filter(user => user.addToAssociation === "Yes")
    .map(user => user.userId)
    // Retrieve the users names
    const userNamesToAdd = usersToAdd.map((userId) => {
      const user = this.users.find((user) => user.id === +userId);
      return user ? user.firstname + ' ' + user.lastname : '';
    })
    const associationData = {
      name: this.name.value,
      usersId: usersToAdd,
      usersName: userNamesToAdd,
      password: this.password.value
    }

    this.api.put({ endpoint: `/associations/${this.association.id}`, data: associationData})
    .then(() => {
      console.log(`Association ${this.association.id} successfully updated`);
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
    if (control.hasError('required')) {
      this.errorMessage[fieldName] = 'This field is required';
    }
  }

}
