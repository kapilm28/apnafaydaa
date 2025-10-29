import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.html',
})
export class Contact {
  contactForm!: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  onSubmit(): void {
    console.log(this.contactForm.value);  // ✅ check form values

    if (this.contactForm.valid) {
      this.http.post('http://127.0.0.1:8000/api/contact/', this.contactForm.value)
        .subscribe({
          next: (res: any) => {
            this.successMessage = res.message || 'Message sent successfully!';
            this.contactForm.reset();
            setTimeout(() => this.successMessage = '', 4000);
          },
          error: () => {
            this.errorMessage = 'Failed to send message. Please try again.';
            setTimeout(() => this.errorMessage = '', 4000);
          }
        });
    } else {
      this.errorMessage = 'Please fill out all required fields.';
      setTimeout(() => this.errorMessage = '', 4000);
    }
  }
}
