import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgClass } from '@angular/common';  // 👈 Import NgClass
import { InsuranceService } from '../insurance-service';

@Component({
  selector: 'app-login',
  standalone: true,   // 👈 Add standalone mode
  imports: [ReactiveFormsModule, NgClass,RouterModule],  // 👈 Include NgClass + ReactiveForms
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;
  showPassword: boolean = false; // 👈 works now

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private insuranceService: InsuranceService
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.http.post<any>('http://127.0.0.1:8000/api/token/', this.loginForm.value)
      .subscribe({
        next: (res) => {
          this.insuranceService.login(res); // save tokens
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = err.error?.detail || 'Invalid credentials';
          setTimeout(() => this.error = '', 4000);
        },
        complete: () => this.loading = false
      });
  }
}
