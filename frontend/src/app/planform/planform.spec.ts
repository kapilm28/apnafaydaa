import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planform } from './planform';

describe('Planform', () => {
  let component: Planform;
  let fixture: ComponentFixture<Planform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
