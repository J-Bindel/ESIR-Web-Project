import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
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
  
  getUserNamesByIds(userIds: string[]): Observable<{ [key: string]: string }> {
    return this.users$.pipe(
      map(users => {
        const userNamesMap: { [key: string]: string } = {};
        userIds.forEach(id => {
          const user = users.find(u => u.id === +id);
          if (user) {
            userNamesMap[id] = user.firstname + ' ' + user.lastname;
          }
        });
        return userNamesMap;
      })
    );
  }
  
}
