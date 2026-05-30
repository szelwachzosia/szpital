import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprzetUzytyComponent } from './sprzet-uzyty.component';

describe('SprzetUzytyComponent', () => {
  let component: SprzetUzytyComponent;
  let fixture: ComponentFixture<SprzetUzytyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprzetUzytyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SprzetUzytyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
