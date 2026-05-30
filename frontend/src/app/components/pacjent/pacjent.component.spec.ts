import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacjentComponent } from './pacjent.component';

describe('PacjentComponent', () => {
  let component: PacjentComponent;
  let fixture: ComponentFixture<PacjentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacjentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacjentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
