import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-password-prompt',
  templateUrl: './password-prompt.component.html',
  styleUrls: ['./password-prompt.component.css']
})
export class PasswordPromptComponent {

  passwordFormControl = new FormControl('', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<PasswordPromptComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.passwordFormControl.valid) {
      const enteredPassword = this.passwordFormControl.value;
      this.dialogRef.close(enteredPassword);
    }
  }
}
