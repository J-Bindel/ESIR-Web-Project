import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
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
  displayedColumns: string[] = ['id', 'name', 'users'];
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
      this.dataSource.data = data.map((association: { id: number; name: string; usersID: number[]; usersName: string[]; password: string; }) => {
        return {
          id: association.id,
          name: association.name,
          usersID: association.usersID,
          usersName: this.replaceUserIdsWithNames(association.usersID),
          password: association.password
        }
      })
    })
    .catch((error) => {
      console.error(error);
    });
  }

  replaceUserIdsWithNames(ids: number[]): string[] {
    return ids.map((id) => {
      const user = this.users.find((user) => user.id === id);
      return user ? user.firstname + ' ' + user.lastname : '';
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

  async openPasswordPrompt(selectedUser: Association): Promise<void> {
    if (this.getSelectedAssociationsCount() !== 1) {
      this.editErrorMessage = 'Select exactly one association when editing';
      return;
    }
    const dialogRef = this.dialog.open(PasswordPromptComponent);
    dialogRef.afterClosed().subscribe(async password => {
      if (password) {
        try {
          const isPasswordCorrect = await this.verifyPassword(selectedUser, password);
        if (isPasswordCorrect) {
          this.openAssociationEditPopup(selectedUser, password);
        } else {
          this.showSnackBar('Incorrect password. Please try again.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
  }

  openAssociationEditPopup(selectedUser: Association, password: string): void {
    const dialogRef = this.dialog.open(AssociationEditPopupComponent, {
      data: { user: selectedUser, password: password }
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
  usersId: string[];
  usersName: string[];
  password: string;
}
