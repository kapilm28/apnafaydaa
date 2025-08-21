import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgetpassword',
  imports: [ReactiveFormsModule,RouterModule],
  templateUrl: './forgetpassword.html',
  styleUrl: './forgetpassword.css'
})
export class Forgetpassword {
    forgotForm: FormGroup;
  message: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  handleresetpass() {
    if (this.forgotForm.invalid) return;

    const email = this.forgotForm.value.email;

    this.http.post('http://127.0.0.1:8000/api/otp-request/', { email }, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          // Navigate to OTP verification page
          this.router.navigate(['/otpverify']);
          // Optionally set success message
          // this.message = res.message;
        },
        error: (err) => {
          this.message = err.error?.error || 'Something went wrong.';
        }
      });
  }
}
