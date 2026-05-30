import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrzedmiotyComponent } from './przedmioty.component';

describe('PrzedmiotyComponent', () => {
  let component: PrzedmiotyComponent;
  let fixture: ComponentFixture<PrzedmiotyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrzedmiotyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrzedmiotyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
