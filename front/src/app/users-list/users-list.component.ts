import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { lastValueFrom, Observable } from 'rxjs';
  
  @Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css'],
  })
  
  export class UsersListComponent implements AfterViewInit {
    displayedColumns: string[] = ['id', 'lastname', 'firstname', 'age'];
    dataSource = new MatTableDataSource<User>();

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor( 
      private http: HttpClient
    ) {}
    ngAfterViewInit(): void {
      const request: Observable<any> = this.http.get('http://localhost:3000/users', { observe: 'response' });
      lastValueFrom(request).then(response => this.dataSource = response.body);
      this.dataSource.paginator = this.paginator;
    }
}

export interface User {
  id: number;
  lastname: string;
  firstname: string;
  age: number;
}
