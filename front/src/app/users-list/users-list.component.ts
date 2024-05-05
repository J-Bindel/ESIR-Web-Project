import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UserEditPopupComponent } from '../user-edit-popup/user-edit-popup.component';
import { ApiHelperService } from '../services/api-helper.service';
  
  @Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css'],
  })
  
  export class UsersListComponent implements AfterViewInit {
    displayedColumns: string[] = ['select', 'id', 'lastname', 'firstname', 'age', 'e-mail'];
    dataSource = new MatTableDataSource<User>();
    selectedRows: SelectionModel<User> = new SelectionModel<User>(true, []);
    editErrorMessage = '';


    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
      private api: ApiHelperService,
      private http: HttpClient,
      public dialog: MatDialog
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

    openPasswordPrompt(selectedUser: User): void {
      if (this.getSelectedUsersCount() !== 1) {
        this.editErrorMessage = 'Select exactly one user when editing';
        return;
      }
      const enteredPassword = prompt('Please enter the password of the selected user:');
      if (enteredPassword !== null) {
        const isPasswordCorrect = this.verifyPassword(selectedUser, enteredPassword);
        if (isPasswordCorrect) {
          this.openUserEditPopup(selectedUser, enteredPassword);
        } else {
          alert('Incorrect password. Please try again.');
        }
      }
    }

    openUserEditPopup(selectedUser: User, password: string): void {
      const dialogRef = this.dialog.open(UserEditPopupComponent, {
        data: { user: selectedUser, password: password }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }

    verifyPassword(selectedUser: User, password: string): boolean {
      this.api.post({ endpoint: '/auth/login', data: { username: selectedUser.email, password: password } })
      .then(response => {
        return true;
      }).catch(error => {
        console.log(error);
        return false;
      });
      return false;
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
