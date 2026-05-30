import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZabiegPacjentLekarzComponent } from './zabieg-pacjent-lekarz.component';

describe('ZabiegPacjentLekarzComponent', () => {
  let component: ZabiegPacjentLekarzComponent;
  let fixture: ComponentFixture<ZabiegPacjentLekarzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZabiegPacjentLekarzComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZabiegPacjentLekarzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
