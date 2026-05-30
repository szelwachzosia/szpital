import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LekiComponent } from './leki.component';

describe('LekiComponent', () => {
  let component: LekiComponent;
  let fixture: ComponentFixture<LekiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LekiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LekiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
