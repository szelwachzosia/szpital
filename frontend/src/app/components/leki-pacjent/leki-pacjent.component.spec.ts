import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LekiPacjentComponent } from './leki-pacjent.component';

describe('LekiPacjentComponent', () => {
  let component: LekiPacjentComponent;
  let fixture: ComponentFixture<LekiPacjentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LekiPacjentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LekiPacjentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
