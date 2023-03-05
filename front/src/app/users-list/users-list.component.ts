import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
  
  @Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css']
  })
  
  export class UsersListComponent implements OnInit {
    constructor( 
      private http: HttpClient
    ) {}
    ngOnInit(): void {
      const request: Observable<any> = this.http.get('http://localhost:3000/users', { observe: 'response' });
      lastValueFrom(request).then(response => this.dataSource = response.body);
    }

    displayedColumns: string[] = ['id', 'lastname', 'firstname', 'age'];
    dataSource = [];
}
