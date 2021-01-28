import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { InspectorComponent } from './inspector.component';
import {MockNgRedux} from "@angular-redux/store/testing";
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require('./../../../../../test/data/illnesses.json');

describe('InspectorComponent', () => {
  let component: InspectorComponent;
  let fixture: ComponentFixture<InspectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InspectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectorComponent);
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
