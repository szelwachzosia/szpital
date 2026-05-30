import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPacjentComponent } from './test-pacjent.component';

describe('TestPacjentComponent', () => {
  let component: TestPacjentComponent;
  let fixture: ComponentFixture<TestPacjentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPacjentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestPacjentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
