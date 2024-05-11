import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './users-list/users-list.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor() { }

  setUsers(users: User[]) {
    this.usersSubject.next(users);
  }

}
