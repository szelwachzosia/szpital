import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LozkoComponent } from './lozko.component';

describe('LozkoComponent', () => {
  let component: LozkoComponent;
  let fixture: ComponentFixture<LozkoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LozkoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LozkoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
