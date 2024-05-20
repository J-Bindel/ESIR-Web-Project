import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiHelperService } from '../services/api-helper.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssociationEditPopupComponent } from '../association-edit-popup/association-edit-popup.component';
import { PasswordPromptComponent } from '../password-prompt/password-prompt.component';
import { User } from '../users-list/users-list.component';
import { UserService } from '../user.service';
import { AssociationCreatePopupComponent } from '../association-create-popup/association-create-popup.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
          userIds: association.userIds,
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

  openAssociationCreatePopup(): void {
    const dialogRef = this.dialog.open(AssociationCreatePopupComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
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

  openConfirmDialog(selectedAssociations: Association[]): void {
    const ids = selectedAssociations.map(association => association.id);
    const message = selectedAssociations.length === 1
      ? `Are you sure you want to delete user ${selectedAssociations[0].name} (ID: ${selectedAssociations[0].id})?`
      : `Are you sure you want to delete these ${selectedAssociations.length} users?`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message, ids }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteAssociations(selectedAssociations);
      }
    });
  }

  deleteAssociations(selectedAssociations: Association[]): void {
    if (this.getSelectedAssociationsCount() <= 0) {
      this.editErrorMessage = 'Select at least one association when deleting';
      return;
    }
    // Extract the IDs from the selected associations
    const ids = selectedAssociations.map(association => association.id);
          
    // Create an array of observable requests
    const requests = ids.map(id => this.api.delete({ endpoint: `/associations/${id}`}));
    forkJoin(requests).subscribe({
      next: results => {
        console.log('All users deleted successfully', results);
      },
      error: error => {
        console.error('Error deleting users', error);
      },
      complete: () => {
        console.log('All delete requests completed');
        window.location.reload();
      }
    });

  }
}

export interface Association {
  id: number;
  name: string;
  userIds: string;
  usersName: string;
  password: string;
}
