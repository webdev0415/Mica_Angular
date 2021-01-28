import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {MultiplierValueComponent} from "./multiplier-value.component";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, FormArray} from "@angular/forms";
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../../../../../app.config";
import {Observable} from "rxjs";
import {CheckSwitchComponent} from "../../../../gui-widgets/components/check-switch/check-switch.component";
import DataStoreRefTypeValue = Workbench.DataStoreRefTypeValue;
import {of} from "rxjs/observable/of";
import { Input, Component } from "@angular/core";
import { PipesModule } from "app/modules/pipes/pipes.module";


@Component({
  selector: "templates-table-value",
  template: "<div></div>",
})

class MockTableValueComponent {
  @Input() required: boolean;
  @Input() value: string | number;
  @Input() label: string;
}

@Component({
  selector: "templates-table-array-value",
  template: "<div></div>",
})
class MockTableArrayValueComponent {
  @Input() formControl: FormGroup;
  @Input() label: string | number;
}

@Component({
  selector: "templates-array-input",
  template: "<div></div>",
})

class MockArrayInputComponent {
  @Input() formControl: FormGroup;
  @Input() title: string | number;
  @Input() type: string;
}

const mockRedux = {
  getState: () => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

@Component({
  selector: "templates-antithesis",
  template: "<div></div>",
})
class MockAntithesisComponent {
  @Input() formControl: FormControl;
  @Input() minMaxRange: string | number;
}

@Component({
  selector: "templates-snomed-codes",
  template: "<div></div>",
})
class MockSnomedCodesComponent {
  @Input() ctrl: FormArray;
  @Input() title: string | number;
}

describe("MultiplierValueComponent", () => {
  let component: MultiplierValueComponent;
  let fixture: ComponentFixture<MultiplierValueComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MultiplierValueComponent,
        MockAntithesisComponent,
        MockTableValueComponent,
        MockTableArrayValueComponent,
        MockSnomedCodesComponent,
        CheckSwitchComponent,
        MockArrayInputComponent
      ],
      providers: [
        {provide: NgRedux, useValue: mockRedux}
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        PipesModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplierValueComponent);
    redux = TestBed.get(NgRedux);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("trackByFn", () => {
    expect(component.trackByFn(0, {name: "name"} as DataStoreRefTypeValue)).toEqual("name");
  });

  it("isCellEdit", () => {
    const cellEdit = [1, 2] as [number, number];
    component.cellEdit = cellEdit;
    expect(component.isCellEdit(cellEdit)).toBeTruthy();
  });

  it("get state", () => {
    const getStateSpy = spyOn(redux, "getState").and.callThrough();
    const res = component["state"];
    expect(getStateSpy).toHaveBeenCalled();
  });

  it("antithesisMinMax", () => {
    expect(component.antithesisMinMax).toEqual([0, 1]);
  });

  it("antithesisMinMax", () => {
    const spy = spyOnProperty<any>(component, "state", "get").and.returnValue({symptomTemplates: {editableProperties: [{name: "name"}]}});
    expect(component.antithesisMinMax).toEqual([-1, -1]);
  });

});
