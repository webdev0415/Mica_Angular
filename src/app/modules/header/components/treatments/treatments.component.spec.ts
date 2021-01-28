import { async, ComponentFixture, TestBed } from '@angular/core/testing';
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require('./../../../../../test/data/illnesses.json');

import { TreatmentsComponent } from './treatments.component';

describe('TreatmentsComponent', () => {
  let component: TreatmentsComponent;
  let fixture: ComponentFixture<TreatmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreatmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should return proper idIcd10Code', () => {
    expect(component["observableMap"](null)).toEqual("");
    expect(component["observableMap"](fakeIllnesses[0])).toEqual(fakeIllnesses[0].form.idIcd10Code);
  });
});
