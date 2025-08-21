// payment-login.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-login',
  template: '' // no UI rendered
})
export class PaymentLogin implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to query params
    this.route.queryParams.subscribe(params => {
      const access = params['access'];
      const refresh = params['refresh'];

      if (access && refresh) {
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        this.router.navigate(['/']); // redirect to home/dashboard
      } else {
        alert('Missing tokens. Please login manually.');
        this.router.navigate(['/login']);
      }
    });
  }
}
