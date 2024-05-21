import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserEditPopupComponent } from '../user-edit-popup/user-edit-popup.component';
import { ApiHelperService } from '../services/api-helper.service';
import { PasswordPromptComponent } from '../password-prompt/password-prompt.component';
import { UserService } from '../user.service';
import { UserCreatePopupComponent } from '../user-create-popup/user-create-popup.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
  
  @Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css'],
  })
  
  export class UsersListComponent implements AfterViewInit {
    displayedColumns: string[] = ['select', 'id', 'lastname', 'firstname', 'age', 'e-mail'];
    dataSource = new MatTableDataSource<User>();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    selectedRows: SelectionModel<User> = new SelectionModel<User>(true, []);
    editErrorMessage = '';

    constructor(
      private api: ApiHelperService,
      private userService: UserService,
      public dialog: MatDialog,
      private _snackBar: MatSnackBar
    ) {}
    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
      this.fetchUsersData();
    }

    fetchUsersData() {
      this.api.get({ endpoint: '/users' })
      .then((data) => {
        this.dataSource.data = data;
        this.userService.setUsers(data);
      })
      .catch((error) => {
        console.error(error);
      });
    }

    globalToggle() {
      if (this.isAllChecked()) {
        this.selectedRows.clear();
      } else {
        this.dataSource.data.forEach(row => this.selectedRows.select(row));
      }
    }
  
    isAllChecked() {
      const numberChecked = this.selectedRows.selected.length;
      const numberRows = this.dataSource.data.length;
      return numberChecked === numberRows;
    }
    
    getSelectedUsersCount(): number {
      return this.selectedRows.selected.length;
    }

    openUserEditPopup(selectedUser: User, password: string): void {
      const dialogRef = this.dialog.open(UserEditPopupComponent, {
        data: { user: selectedUser, password: password }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }

    openUserCreatePopup(): void {
      const dialogRef = this.dialog.open(UserCreatePopupComponent);

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });

    }

    async openPasswordPrompt(selectedUser: User): Promise<void> {
      if (this.getSelectedUsersCount() !== 1) {
        this.editErrorMessage = 'Select exactly one user when editing';
        return;
      }
      const dialogRef = this.dialog.open(PasswordPromptComponent);
      dialogRef.afterClosed().subscribe(async password => {
        if (password) {
          try {
            const isPasswordCorrect = await this.verifyPassword(selectedUser, password);
            if (isPasswordCorrect) {
              this.openUserEditPopup(selectedUser, password);
            } else {
              this.showSnackBar('Incorrect password. Please try again.');
            }
          } catch (error) {
            console.error(error);
        }
      }
    });
    }

    async verifyPassword(selectedUser: User, password: string): Promise<boolean> {
      try {
        const response = await this.api.post({ endpoint: '/auth/user/login', data: { username: selectedUser.email, password: password } });
        return true;
      } catch (error) {
        console.log(error);
        this.editErrorMessage = 'Incorrect selected user password';
        return false;
      }
    }

    showSnackBar(message: string): void {
      this._snackBar.open(message, 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
    }

    openConfirmDialog(selectedUsers: User[]): void {
      const ids = selectedUsers.map(user => user.id);
      const message = selectedUsers.length === 1
      ? `Are you sure you want to delete user ${selectedUsers[0].firstname} ${selectedUsers[0].lastname} (ID: ${selectedUsers[0].id})?`
      : `Are you sure you want to delete these ${selectedUsers.length} users?`;
  
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { message, ids }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteUsers(selectedUsers);
        }
      });
    }
    
    deleteUsers(selectedUsers: User[]) {
      if (this.getSelectedUsersCount() <= 0) {
        this.editErrorMessage = 'Select at least one user when deleting';
        return;
      }
      
      // Extract the IDs from the selected users
      const ids = selectedUsers.map(user => user.id);
      
      // Create an array of observable requests
      const requests = ids.map(id => this.api.delete({ endpoint: `/users/${id}`}));
      forkJoin(requests).subscribe({
        next: results => {
          console.log('All users deleted successfully', results);
        },
        error: error => {
          console.error('Error deleting users', error);
        },
        complete: () => {
          console.log('All delete requests completed');
          window.location.reload();
        }
      });
    }
}

export interface User {
  id: number;
  lastname: string;
  firstname: string;
  age: number;
  email: string;
  password: string;
}
