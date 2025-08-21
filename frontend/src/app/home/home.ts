import { Component, OnInit, signal } from '@angular/core';
import { JsonPipe, NgFor } from '@angular/common';
import{ InsuranceService } from '../insurance-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [JsonPipe,NgFor, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

    protected readonly title = signal('frontend');

      constructor(private InsuranceService:InsuranceService){}

      insuranceplan: any;

      ngOnInit(): void {

        this.InsuranceService.getplan().subscribe({
          next:(data) => {
            this.insuranceplan = data;
            console.log(data) 
          },
          error: (error) => {
            console.error('Error:',error)
          }
        })
        
      }

}
