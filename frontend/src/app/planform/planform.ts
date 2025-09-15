import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InsuranceService } from '../insurance-service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-planform',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './planform.html',
  styleUrls: ['./planform.css']
})
export class Planform implements OnInit {

  plan: any;
  planForm: FormGroup;

  qrCodeUrl: string | null = null;
  upiUrl: string | null = null;

  // ✅ previews
  previewPan: string | null = null;
  previewAadhaarFront: string | null = null;
  previewAadhaarBack: string | null = null;

  // ✅ hold selected files
  panFile: File | null = null;
  aadhaarFrontFile: File | null = null;
  aadhaarBackFile: File | null = null;

  // ✅ file input references
  @ViewChild('panInput') panInput!: ElementRef<HTMLInputElement>;
  @ViewChild('frontInput') frontInput!: ElementRef<HTMLInputElement>;
  @ViewChild('backInput') backInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private insuranceService: InsuranceService,
    private fb: FormBuilder,
    private http: HttpClient,
    private paymentService: PaymentService
  ) {
    this.planForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      dob: ['', Validators.required],
      age: [''],
      pan_number: ['', Validators.required],
      annual_income: ['', Validators.required],
      aadhaar_number: ['', Validators.required],
      nominee_name: ['', Validators.required],
      nominee_dob: ['', Validators.required],
      nominee_relation: ['', Validators.required]
    });
  }

  // ✅ file handler
  onFileChange(event: any, type: 'pan' | 'aadhaar_front' | 'aadhaar_back') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'pan') {
          this.previewPan = reader.result as string;
          this.panFile = file;
        }
        if (type === 'aadhaar_front') {
          this.previewAadhaarFront = reader.result as string;
          this.aadhaarFrontFile = file;
        }
        if (type === 'aadhaar_back') {
          this.previewAadhaarBack = reader.result as string;
          this.aadhaarBackFile = file;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ clear specific file
  clearFile(type: 'pan' | 'front' | 'back') {
    if (type === 'pan') {
      this.previewPan = null;
      this.panFile = null;
      this.panInput.nativeElement.value = '';
    }
    if (type === 'front') {
      this.previewAadhaarFront = null;
      this.aadhaarFrontFile = null;
      this.frontInput.nativeElement.value = '';
    }
    if (type === 'back') {
      this.previewAadhaarBack = null;
      this.aadhaarBackFile = null;
      this.backInput.nativeElement.value = '';
    }
  }

  ngOnInit(): void {
    // reset previews on reload
    this.previewPan = null;
    this.previewAadhaarFront = null;
    this.previewAadhaarBack = null;
    this.panFile = null;
    this.aadhaarFrontFile = null;
    this.aadhaarBackFile = null;

    setTimeout(() => {
      if (this.panInput) this.panInput.nativeElement.value = '';
      if (this.frontInput) this.frontInput.nativeElement.value = '';
      if (this.backInput) this.backInput.nativeElement.value = '';
    });

    const token = localStorage.getItem('access');
    if (token) {
    this.insuranceService.getMe()?.subscribe({
      next: (user) => {
        this.planForm.patchValue({
          firstname: user.first_name,
          lastname: user.last_name,
          email: user.email,
          mobile: user.phone,
          username: user.username,
          dob: user.dob,
          annual_income: user.annual_income,
          pan_number: user.pan_number,
          aadhaar_number: user.aadhaar_number,
          nominee_name: user.nominee_name,
          nominee_dob: user.nominee_dob,
          nominee_relation: user.nominee_relation
        });

        console.log(user.pan_photo)

        // optional: set previews if user has uploaded files before
        if (user.pan_photo) this.previewPan = user.pan_photo;
        if (user.aadhaar_front_photo) this.previewAadhaarFront = user.aadhaar_front_photo;
        if (user.aadhaar_back_photo) this.previewAadhaarBack = user.aadhaar_back_photo;
      },
      error: (err) => console.error('Error fetching user data', err)
    });
  }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.insuranceService.getPlanById(id).subscribe({
        next: (data) => this.plan = data,
        error: (err) => console.error('Error fetching plan', err),
      });
    }

    // auto-calc age
    this.planForm.get('dob')?.valueChanges.subscribe(dob => {
      if (dob) {
        const age = this.calculateAge(dob);
        this.planForm.patchValue({ age }, { emitEvent: false });
      }
    });
  }

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  get isAgeInvalid(): boolean {
    const age = this.planForm.get('age')?.value;
    return age && (age < 18 || age > 60);
  }

  // handlePaymentStart(event: Event) {
  //   event.preventDefault();

  //   if (this.planForm.invalid || this.isAgeInvalid) {
  //     console.warn("Form invalid or age invalid");
  //     return;
  //   }

  //   this.http.post<any>(
  //     "http://127.0.0.1:8000/initiate/",
  //     {
  //       amount: 500,
  //       upi_id: "kmeghnani28@okhdfcbank",
  //       name: "Kapil Meghnani",
  //     },
  //     {
  //       headers: new HttpHeaders({
  //         "Content-Type": "application/json",   // 👈 force JSON
  //       }),
  //     }
  //   ).subscribe({
  //     next: (upiData) => {
  //       console.log("✅ UPI Data received:", upiData);

  //       const qrImg = document.createElement("img");
  //       qrImg.src = upiData.qr_code;
  //       qrImg.style.width = "200px";
  //       qrImg.style.height = "200px";
  //       document.body.appendChild(qrImg);

  //       window.location.href = upiData.upi_url; // works only on mobile with UPI app
  //     },
  //     error: (err) => {
  //       console.error("❌ UPI Payment initiation failed:", err);
  //     },
  //   });

  // }

  handlePaymentStart(event: Event) {
    event.preventDefault();

    if (this.planForm.invalid || this.isAgeInvalid) {
      console.warn("Form invalid or age invalid");
      return;
    }

    const formData = new FormData();

    // ✅ append text fields from form
    Object.entries(this.planForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as any);
      }
    });

    // ✅ append file fields
    if (this.panFile) formData.append('pan_photo', this.panFile);
    if (this.aadhaarFrontFile) formData.append('aadhaar_front_photo', this.aadhaarFrontFile);
    if (this.aadhaarBackFile) formData.append('aadhaar_back_photo', this.aadhaarBackFile);

    // ✅ append plan id
    formData.append('plan_id', this.plan.id);

    // 🔍 Debug log (show exactly what is sent)
    for (let [key, val] of formData.entries()) {
      console.log(`${key}:`, val);
    }

    // ✅ send to backend
    this.http.post<any>('http://127.0.0.1:8000/api/initiate-payment/', formData, {
      headers: new HttpHeaders({}) // keeps content-type = multipart/form-data
    }).subscribe({
      next: (payuData) => {
        console.log("PayU data received:", payuData);

        // ✅ dynamically build form and auto-submit to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://test.payu.in/_payment';

        for (const key in payuData) {
          if (payuData.hasOwnProperty(key)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = payuData[key];
            form.appendChild(input);
          }
        }

        document.body.appendChild(form);
        form.submit();
      },
      error: (err) => {
        console.error("❌ Payment initiation failed:", err);
      }
    });    

  }
}
