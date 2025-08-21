import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { InsuranceService } from '../insurance-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  isLoggedIn: boolean = false;

  constructor(
    private insuranceService: InsuranceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // subscribe to login state
    this.insuranceService.isLoggedIn$.subscribe(
      (status) => this.isLoggedIn = status
    );
  }

  logout() {
    this.insuranceService.logout();
    this.router.navigate(['/login']);
  }
}
