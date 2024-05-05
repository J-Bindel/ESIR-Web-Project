import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { UserEditPopupComponent } from '../user-edit-popup/user-edit-popup.component';
import { ApiHelperService } from '../services/api-helper.service';
import { PasswordPromptComponent } from '../password-prompt/password-prompt.component';
  
  @Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css'],
  })
  
  export class UsersListComponent implements AfterViewInit {
    @ViewChild(MatSidenav)
    sidenav!: MatSidenav;
    isCollapsed = true;
    displayedColumns: string[] = ['select', 'id', 'lastname', 'firstname', 'age', 'e-mail'];
    dataSource = new MatTableDataSource<User>();
    selectedRows: SelectionModel<User> = new SelectionModel<User>(true, []);
    editErrorMessage = '';


    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
      private api: ApiHelperService,
      private http: HttpClient,
      public dialog: MatDialog,
      private _snackBar: MatSnackBar
    ) {}
    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
      this.fetchData().subscribe((data) => {
        this.dataSource.data = data;
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

    fetchData(): Observable<User[]> {
      return this.http.get<User[]>('http://localhost:3000/users');
    }
    
    getSelectedUsersCount(): number {
      return this.selectedRows.selected.length;
    }

    toggleMenu() {
      this.sidenav.open();
      this.isCollapsed = !this.isCollapsed;
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

    openUserEditPopup(selectedUser: User, password: string): void {
      const dialogRef = this.dialog.open(UserEditPopupComponent, {
        data: { user: selectedUser, password: password }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }

    async verifyPassword(selectedUser: User, password: string): Promise<boolean> {
      try {
        const response = await this.api.post({ endpoint: '/auth/login', data: { username: selectedUser.email, password: password } });
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

}

export interface User {
  id: number;
  lastname: string;
  firstname: string;
  age: number;
  email: string;
  password: string;
}
