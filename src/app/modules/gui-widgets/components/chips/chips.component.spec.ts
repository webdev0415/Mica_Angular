import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipsComponent } from './chips.component';

describe('ChipsComponent', () => {
  let component: ChipsComponent;
  let fixture: ComponentFixture<ChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("chipsClass", () => {
    expect(component["chipsClass"].length).not.toEqual(0);
  });
});
