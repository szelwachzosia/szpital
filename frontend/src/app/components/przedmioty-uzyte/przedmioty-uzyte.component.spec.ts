import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrzedmiotyUzyteComponent } from './przedmioty-uzyte.component';

describe('PrzedmiotyUzyteComponent', () => {
  let component: PrzedmiotyUzyteComponent;
  let fixture: ComponentFixture<PrzedmiotyUzyteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrzedmiotyUzyteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrzedmiotyUzyteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
