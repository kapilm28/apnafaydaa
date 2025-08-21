import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-otp-submit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgClass],
  templateUrl: './otpverify.html',
  styleUrls: ['./otpverify.css']
})
export class Otpverify {
  otpForm: FormGroup;
  message: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required]]
    });
  }

  verifyOTP() {
    if (this.otpForm.invalid) return;

    const otp = this.otpForm.value.otp;

    this.http.post<any>('http://127.0.0.1:8000/api/otp-verify/', { otp }, { withCredentials: true })
      .subscribe({
        next: (res) => {
          const { message, username } = res;
          this.message = `${message} Welcome ${username}`;
          localStorage.setItem('username', username);
          this.router.navigate(['/resetpass']); // navigate to reset password page
        },
        error: (err) => {
          this.message = err.error?.error || "Verification failed.";
        }
      });
  }
}
