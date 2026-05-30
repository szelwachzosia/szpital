import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprzetyComponent } from './sprzety.component';

describe('SprzetyComponent', () => {
  let component: SprzetyComponent;
  let fixture: ComponentFixture<SprzetyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprzetyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SprzetyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
