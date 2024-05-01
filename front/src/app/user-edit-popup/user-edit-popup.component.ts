import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../users-list/users-list.component';

@Component({
  selector: 'app-user-edit-popup',
  templateUrl: './user-edit-popup.component.html',
  styleUrls: ['./user-edit-popup.component.css']
})
export class UserEditPopupComponent {
  user: User;
  
  constructor(
    public dialogRef: MatDialogRef<UserEditPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private http: HttpClient,
  ) {
    this.user = data.user;
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(form: NgForm): void {
    this.http.put(`http://localhost:3000/users/${this.user.id}`, form.value)
    .subscribe(response => {
      console.log('User updated successfully', response);
  });
  this.dialogRef.close();
  }
}