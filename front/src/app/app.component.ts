import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { TokenStorageService } from './services/token-storage.service';

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
    public router: Router,
    private tokenStorageService: TokenStorageService,
  ) { }

  toggleMenu() {
    this.sidenav.open();
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    this.tokenStorageService.clear();
    this.router.navigate(['/login']);
  }
  
}
