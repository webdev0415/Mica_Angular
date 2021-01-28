import { async, ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import * as _ from "lodash";

import { RowsComponent } from "./rows.component";
import { Component, Input } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import * as errors from "../../../util/forms/errors";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

const fakeIllness: Illness.Normalized.IllnessValue = require("./../../../../test/data/illnesses.json")[0];

@Component({
  selector: "mica-symptom-row",
  template: "<div></div>"
})
class MockRowComponent {
  @Input() readOnly = false;
  @Input() readonly symptomData: Symptom.Data;
  @Input() dataStoreRefTypes: Workbench.DataStoreRefTypesDictionary;
  @Input() readonly rowCtrl: FormGroup;
  @Input() readonly allMultiplierValues: (string | string[] | [number, number])[];
  @Input() readonly removable: boolean;
  @Input() readonly rowIndex: number;
}

describe("RowsComponent", () => {
  let component: RowsComponent;
  let fixture: ComponentFixture<RowsComponent>;
  const fb = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RowsComponent,
        MockRowComponent
      ],
      imports: [
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const symptoms = fakeIllness.entities.symptoms;
    const symptom = symptoms[Object.keys(symptoms)[0]];
    fixture = TestBed.createComponent(RowsComponent);
    component = fixture.componentInstance;
    component.rowsFormArray = new FormArray(_.map(symptom.rows, row => new FormControl(row)));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    const rows = [
      { bias: true },
      { bias: false },
    ];

    component["rowsFormArray"] = fb.array(rows.map(row => fb.group(row)));
    component.ngOnInit();
    component["rowsAnimate"][0] = "remove";
    component["rowsFormArray"].removeAt(0);
    expect(component["rowsAnimate"].length).toEqual(component["rowsFormArray"].length);
  });

  it("ngOnChanges boolean", () => {
    const onRemoveRowSpy = spyOn(component, "onRemoveRow");
    component.maxRowsReached = true;
    component.ngOnChanges();
    expect(onRemoveRowSpy).not.toHaveBeenCalled();
  });

  it("ngOnChanges number", () => {
    const onRemoveRowSpy = spyOn(component, "onRemoveRow");
    component.maxRowsReached = 1;
    component.rowsFormArray = new FormArray([
      new FormControl({multiplier: ["value"]} as Symptom.RowValue),
      new FormControl({multiplier: [""]} as Symptom.RowValue)
    ]);
    component.ngOnChanges();
    expect(onRemoveRowSpy).toHaveBeenCalledWith(1);
  });

  it("rowAnimateState", () => {
    const idx = 1;
    expect(component.rowAnimateState(idx)).toEqual(component["rowsAnimate"][idx]);
  });

  it("trackByFn", () => {
    const idx = 1;
    const value = {bias: true} as Symptom.RowValue;
    expect(component.trackByFn(idx, value)).toEqual(value);
  });

  it("onRemoveRow", () => {
    const idx = 1;
    component.onRemoveRow(idx);
    expect(component["rowsAnimate"][idx]).toEqual("remove");
  });

  it("onRowError", () => {
    const error = {index: 1};
    const rowIndex = 1;
    const mockCompactErrorCollection = spyOn(errors, "compactErrorCollection").and.callFake(() => {
    });
    component.onRowError(error, rowIndex);
    expect(mockCompactErrorCollection).toHaveBeenCalledWith(error, rowIndex, component["errorsPublisherSrc"]);
  });

  it("onRowAnimationEnd", () => {
    const errors = [{index: 0}, {index: 1}, {index: 2}];
    const error = errors[1];
    component["rowsAnimate"] = ["remove"];
    component["errorsPublisherSrc"].next(errors);
    component.onRowAnimationEnd(error.index);
    expect(component["errorsPublisherSrc"].value).toEqual([
      {index: 0},
      {index: 1}
    ]);

    component["rowsAnimate"] = ["in"];
    component.onRowAnimationEnd(error.index);
    expect(component["rowsAnimate"][error.index]).toEqual("stable");

    const lastValue = component["errorsPublisherSrc"].value;
    component["rowsAnimate"] = [];
    component.onRowAnimationEnd(error.index);
    expect(lastValue).toEqual(component["errorsPublisherSrc"].value);
  });

  it("should push into rowsAnimate", () => {
    const pushSpy = spyOn(component["rowsAnimate"], "push").and.callThrough();
    component.rowsFormArray.push(new FormControl("new val"));
    expect(pushSpy).toHaveBeenCalledWith("in");
  });

  it("allMultiplierValues", () => {
    component.rowsFormArray = new FormArray([new FormControl({
      multiplier: [0]
    })]);
    expect(component.allMultiplierValues).toBeDefined();
  });

  it("rowsFormArray readOnly", fakeAsync(() => {
    component["rowsAnimate"] = ["in", "remove"];
    component.readOnly = true;
    const control = new FormControl({multiplier: [0]});
    component.rowsFormArray.push(control);
    tick(10);
    expect(component["rowsAnimate"]).toEqual(["in", "remove"]);
  }));

});
