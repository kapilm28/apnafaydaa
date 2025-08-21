import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {

  constructor(private httpclient: HttpClient){}

  getplan(): Observable <any> {
    return this.httpclient.get('http://127.0.0.1:8000/api/plans/')
  }

  getPlanById(id: string) {
    return this.httpclient.get(`http://127.0.0.1:8000/api/plans/${id}/`);
  }

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  login(tokens: { access: string, refresh: string }) {
    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
    this.loggedIn.next(true);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.loggedIn.next(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('access');
  }

  getMe() {
    const token = localStorage.getItem('access');
    if (!token) return null;
    return this.httpclient.get<any>('http://127.0.0.1:8000/api/me/', {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
  
}
