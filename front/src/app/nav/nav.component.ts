import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

  public isLogged: boolean;

  constructor(
    private tokenStorageService: TokenStorageService,
    private route: Router
  ) {
    this.isLogged = this.tokenStorageService.isLogged();
  }
  
  logout(): void {
    this.tokenStorageService.clear();
    this.route.navigateByUrl("/login");
  }
}
