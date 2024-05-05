import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
    
  isCollapsed = true;

  constructor(
    public router: Router
  ) { }

  toggleMenu() {
    this.sidenav.open();
    this.isCollapsed = !this.isCollapsed;
  }
}
