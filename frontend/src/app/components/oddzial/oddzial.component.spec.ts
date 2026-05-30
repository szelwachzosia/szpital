import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OddzialComponent } from './oddzial.component';

describe('OddzialComponent', () => {
  let component: OddzialComponent;
  let fixture: ComponentFixture<OddzialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OddzialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OddzialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
