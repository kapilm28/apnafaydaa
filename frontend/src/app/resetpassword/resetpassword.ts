import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-resetpassword',
  imports: [ReactiveFormsModule, RouterModule, NgClass],
  templateUrl: './resetpassword.html',
  styleUrl: './resetpassword.css'
})
export class Resetpassword {
  resetForm: FormGroup;
  message: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]]
    });
  }

  handleReset() {
    if (this.resetForm.invalid) return;

    const password = this.resetForm.value.password;
    const confirm_password = this.resetForm.value.confirm_password;
    const username = localStorage.getItem('username');

    this.http.post<any>('http://127.0.0.1:8000/api/reset-password/', { username, password, confirm_password }, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.message = res.message || 'Password reset successful.';
          this.router.navigate(['/']); // redirect to login/home
        },
        error: (err) => {
          this.message = err.error?.error || 'Reset failed.';
        }
      });
  }
}
