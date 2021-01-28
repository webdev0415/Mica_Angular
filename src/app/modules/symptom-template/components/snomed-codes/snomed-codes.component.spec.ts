import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { SnomedCodesComponent } from "./snomed-codes.component";
import {FormControl, FormsModule, ReactiveFormsModule, FormArray, FormGroup, NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import { Input, Component, forwardRef } from "@angular/core";
import { PipesModule } from "app/modules/pipes/pipes.module";
import { truncate } from "fs";

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
  selector: "templates-array-input",
  template: "<div></div>",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockArrayInputComponent),
      multi: true
    }
  ]
})
class MockArrayInputComponent implements ControlValueAccessor {
  @Input() formControl: FormControl;
  @Input() title: string | number;
  @Input() type: string;
  writeValue(obj: any) {};
  registerOnChange(fn: any) {};
  registerOnTouched(fn: any) {};
}

@Component({
  selector: "templates-input",
  template: "<div></div>",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockInputComponent),
      multi: true
    }
  ]
})
class MockInputComponent implements ControlValueAccessor {
  @Input() formControl: FormControl;
  @Input() title: string | number;
  writeValue(obj: any) {};
  registerOnChange(fn: any) {};
  registerOnTouched(fn: any) {};
}


describe("SnomedCodesComponent", () => {
  let component: SnomedCodesComponent;
  let fixture: ComponentFixture<SnomedCodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SnomedCodesComponent,
        MockArrayInputComponent,
        MockTableValueComponent,
        MockInputComponent
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
    fixture = TestBed.createComponent(SnomedCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    component.ctrl.push(new FormGroup({}));
    component.ctrl.push(new FormGroup({
      snomedCodes: new FormArray([]),
      snomedName: new FormControl({})
    }));
    component.ngOnInit()
    const fg = component.ctrl.at(0);
    expect(fg.value).toEqual({snomedCodes: [], snomedName: ""});
    const fg2 = component.ctrl.at(1);
    expect(fg2.get("snomedCodes") instanceof FormControl).toBe(true);
  });

  it("addSnomedRow / removeRow", () => {
    component.addSnomedRow();
    expect(component.ctrl.controls.length).toBe(2);
    component.removeRow(0);
    expect(component.ctrl.controls.length).toBe(1);
  })
});
