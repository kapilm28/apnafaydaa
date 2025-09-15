// payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = 'http://127.0.0.1:8000/api/upi-payment/';

  constructor(private http: HttpClient) {}

  initiate(amount: number, upi_id: string, name: string) {
    return this.http.post<any>(this.api, { amount, upi_id, name });
  }
}
