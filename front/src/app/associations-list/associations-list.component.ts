import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiHelperService } from '../services/api-helper.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssociationEditPopupComponent } from '../association-edit-popup/association-edit-popup.component';
import { PasswordPromptComponent } from '../password-prompt/password-prompt.component';
import { User } from '../users-list/users-list.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-associations-list',
  templateUrl: './associations-list.component.html',
  styleUrls: ['./associations-list.component.css']
})
export class AssociationsListComponent implements AfterViewInit{
  displayedColumns: string[] = ['select', 'id', 'name', 'users'];
  dataSource = new MatTableDataSource<Association>();
  users: User[] = [];
  selectedRows: SelectionModel<Association> = new SelectionModel<Association>(true, []);
  editErrorMessage = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private api: ApiHelperService,
    private userService: UserService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.userService.users$.subscribe((users => {
      this.users = users;
    }))
    this.fetchAssociationsData();
  }

  fetchAssociationsData() {
    this.api.get({ endpoint: '/associations' })
    .then((data) => {
      const associationDataPromises = data.map(async (association: { id: number; name: string; userIds: string; password: string; }) => {
        const usersName = await this.replaceUserIdsWithNames(association.userIds);
        return {
          id: association.id,
          name: association.name,
          usersId: association.userIds,
          usersName: usersName,
          password: association.password
        };
      });

      Promise.all(associationDataPromises)
      .then(associations => {
        this.dataSource.data = associations;
      })
      .catch(error => {
        console.error('Error fetching association data', error);
      });
    })
    .catch((error) => {
      console.error('Error fetching associations', error);
    })
  }

  replaceUserIdsWithNames(userIds: string): Promise<string> {
    const userIdArray = userIds.split(',');
    return firstValueFrom(this.userService.getUserNamesByIds(userIdArray))
    .then(userNamesMap => {
      return userIdArray.map(id => userNamesMap[id] || id).join(', ');
    })
    .catch(error => {
      console.error('Error fetching user names', error);
      return userIds;
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

  getSelectedAssociationsCount(): number {
    return this.selectedRows.selected.length;
  }

  async openPasswordPrompt(selectAssociation: Association): Promise<void> {
    if (this.getSelectedAssociationsCount() !== 1) {
      this.editErrorMessage = 'Select exactly one association when editing';
      return;
    }
    const dialogRef = this.dialog.open(PasswordPromptComponent);
    dialogRef.afterClosed().subscribe(async password => {
      if (password) {
        try {
          const isPasswordCorrect = await this.verifyPassword(selectAssociation, password);
        if (isPasswordCorrect) {
          this.openAssociationEditPopup(selectAssociation, password);
        } else {
          this.showSnackBar('Incorrect password. Please try again.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
  }

  openAssociationEditPopup(selectAssociation: Association, password: string): void {
    const dialogRef = this.dialog.open(AssociationEditPopupComponent, {
      data: { user: selectAssociation, password: password }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  async verifyPassword(selectedAssociation: Association, password: string): Promise<boolean> {
    try {
      const response = await this.api.post({ endpoint: '/auth/association/login', data: { id: selectedAssociation.id, password: password } });
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

export interface Association {
  id: number;
  name: string;
  usersId: string;
  usersName: string;
  password: string;
}
