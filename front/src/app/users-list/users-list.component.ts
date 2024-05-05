import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UserEditPopupComponent } from '../user-edit-popup/user-edit-popup.component';
  
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

    openUserEditPopup(selectedUser: User): void {
      if (this.getSelectedUsersCount() !== 1) {
        this.editErrorMessage = 'Select exactly one user when editing';
        return;
      }

      const dialogRef = this.dialog.open(UserEditPopupComponent, {
        data: { user: selectedUser }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
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
