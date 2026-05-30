import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZmianyComponent } from './zmiany.component';

describe('ZmianyComponent', () => {
  let component: ZmianyComponent;
  let fixture: ComponentFixture<ZmianyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZmianyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZmianyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
