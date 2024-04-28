import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
  
  @Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css'],
  })
  
  export class UsersListComponent implements AfterViewInit {
    displayedColumns: string[] = ['select', 'id', 'lastname', 'firstname', 'age'];
    dataSource = new MatTableDataSource<User>();
    selectedRows: SelectionModel<User> = new SelectionModel<User>(true, []);


    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor( 
      private http: HttpClient
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

}

export interface User {
  id: number;
  lastname: string;
  firstname: string;
  age: number;
}
