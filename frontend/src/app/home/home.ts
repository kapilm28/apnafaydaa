import { Component, OnInit, signal } from '@angular/core';
import { JsonPipe, NgFor, KeyValuePipe } from '@angular/common';
import{ InsuranceService } from '../insurance-service';
import { RouterLink } from '@angular/router';

interface InsurancePlan {
  id: number;              // 👈 add this
  plan_name: string;
  description?: string;
  price: number
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [JsonPipe,NgFor, RouterLink, KeyValuePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

     protected readonly title = signal('frontend');

      constructor(private insuranceService: InsuranceService) {}

  insuranceplan: InsurancePlan[] = [];  
  groupedPlans: Record<string, InsurancePlan[]> = {};

  groupByPlanName() {
    this.groupedPlans = {};

    this.insuranceplan.forEach((plan: InsurancePlan) => {
      const key = plan.plan_name;
      if (!this.groupedPlans[key]) {
        this.groupedPlans[key] = [];
      }
      this.groupedPlans[key].push(plan);
    });
  }

  ngOnInit(): void {
    this.insuranceService.getplan().subscribe({
      next: (data: InsurancePlan[]) => {
        this.insuranceplan = data;
        this.groupByPlanName();   // ✅ group after data is received
        console.log('Grouped:', this.groupedPlans);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
}
