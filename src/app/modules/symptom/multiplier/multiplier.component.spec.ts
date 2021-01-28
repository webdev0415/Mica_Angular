import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, EventEmitter, Input, Output, TemplateRef } from "@angular/core";
import * as _ from "lodash";

import { MultiplierComponent } from "./multiplier.component";
import { TitleCasePipe } from "../../pipes/title-case.pipe";
import { MultiplierLoaderComponent } from "./loader/loader.component";
import { MultiplierInputComponent } from "./input/input.component";
import { CountryComponent } from "./country/country.component";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RangerComponent } from "./ranger/ranger.component";
import { BadgeIconComponent } from "../../gui-widgets/components/badge-icon/badge-icon.component";
import { DescriptorToggleComponent } from "../descriptor-toggle/descriptor-toggle.component";
import { DropdownContext } from "../../typeahead/dropdown/dropdown.component";
import { NgRedux } from "@angular-redux/store";
import { DataService } from "../services/data.service";
import { DataServiceStub } from "../../../../test/services-stubs/data.service.stub";
import { ApiService } from "../services/api.service";
import { SymptomApiServiceStub } from "../../../../test/services-stubs/symptom-api.service.stub";
import { defaultState } from "../../../app.config";
import { of } from "rxjs/observable/of";
import DataStoreRefType = Workbench.DataStoreRefType;
const fakeSymptoms = require("../../../../../server/test-storage.json").symptoms.data;
import * as symptomsSelectors from "../../../state/symptoms/symptoms.selectors";

const state = _.cloneDeep(defaultState);
(state.symptoms.entities as any).symptoms = fakeSymptoms;

const mockRedux = {
  getState: () => {
    return state
  },
  select: (selector) => of(selector({})),
  dispatch: (arg: any) => {}
};

 @Component({
  selector: "mica-dropdown",
  template: "<div></div>"
})
class FakeDropdownComponent {
  @Input() readOnly = false;
  @Input() controlDisabled = false;
  @Input() title: string;
  @Input() items: MICA.SelectableEl[];
  @Input() excludeItems: string[][] = [];
  @Input() size: "" | "sm" = "";
  @Input() multiSelect = false;
  @Input() placeholder = "Select a Value";
}

@Component({
  selector: "mica-typeahead",
  template: "<div></div>"
})
class FakeTypeaheadComponent {
  @Input() readOnly = false;
  @Input() title = "";
  @Input() enableValidation = true;
  @Input() canClose = true;
  @Input() small = false;
  @Input() typeAheadMin = 2;
  @Input() valueValid: string;
  @Input() excludeItems: string[] = [];
  @Input() resultKey: "name" | "value";
  @Input() placeholder = "Search...";
  @Input() items: MICA.SelectableEl[]; // will be of type static
  @Input() urlQuery = "";
  @Input() liveSearchType: MICA.LiveSearchType; // will be of type liveSearch
  @Input() templateRef: TemplateRef<DropdownContext>;
  @Input() dropdownAlignment = "left";
  @Input() sortByKey: string | string[] = "name";
  @Input() required = true;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Input() icd10CodeSearch: boolean;
  @Input() removeSelectedValues = true;
}

describe("MultiplierComponent", () => {
  let component: MultiplierComponent;
  let fixture: ComponentFixture<MultiplierComponent>;
  let apiService: ApiService;
  let dataService: DataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MultiplierComponent,
        TitleCasePipe,
        MultiplierLoaderComponent,
        MultiplierInputComponent,
        CountryComponent,
        FakeTypeaheadComponent,
        FakeDropdownComponent,
        MultiplierInputComponent,
        RangerComponent,
        BadgeIconComponent,
        DescriptorToggleComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: DataService, useClass: DataServiceStub },
        { provide: ApiService, useClass: SymptomApiServiceStub }
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    apiService = TestBed.get(ApiService);
    dataService = TestBed.get(DataService);
    fixture = TestBed.createComponent(MultiplierComponent);
    component = fixture.componentInstance;
    component.multiplierDataStore = fakeSymptoms[Object.keys(fakeSymptoms)[0]];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("get multiplierTypeaheadType", () => {
    const type = "test type";
    spyOn(component as any, "getTypeaheadOptions").and.returnValue({type: type});
    expect(component.multiplierTypeaheadType).toEqual(type);
  });

  it("get multiplierSearchName", () => {
    const type = "test type";
    spyOnProperty(component, "multiplierItems", "get").and.returnValue(of([1, 2, 3]));
    spyOn(component as any, "getTypeaheadOptions").and.returnValue({type: type});
    component.multiplierSearchName.subscribe(val => {
      expect(val).toEqual("");
    });
  });

  it("get multiplierItems", () => {
    const dataStoreRefTypeName = "New";
    const mockGetTypeaheadOptions = spyOn(component as any, "getTypeaheadOptions").and.returnValue({dataStoreRefTypeName});
    spyOn(apiService, "typeAheadValues$").and.returnValue(of([]));

    component.multiplierItems.subscribe(res => expect(res).toEqual([]));

    mockGetTypeaheadOptions.and.returnValue(null);
    component.multiplierItems.subscribe(res => expect(res).toEqual([]));
  });

  it("get multiplierType", () => {
    const mockRangeValues = spyOnProperty(component, "rangeValues", "get").and.callThrough();
    const mockDescriptorFile = spyOnProperty(component, "descriptorFile", "get").and.callThrough();
    const mockGetTypeaheadOptions = spyOn(component as any, "getTypeaheadOptions").and.callThrough();
    const multiplierDataStore = {
      title: "some title",
      values: [{
        code: "code",
        name: "name",
        m_antithesis: 1
      }]
    };
    expect(component.multiplierType).toEqual("input");

    component.multiplierDataStore = multiplierDataStore;
    expect(component.multiplierType).toEqual("dropdown");

    multiplierDataStore.title = "Geography";
    expect(component.multiplierType).toEqual("country");

    mockRangeValues.and.returnValue([1, 1]);
    expect(component.multiplierType).toEqual("ranger");

    mockGetTypeaheadOptions.and.returnValue({});
    expect(component.multiplierType).toEqual("typeahead");

    mockDescriptorFile.and.returnValue("yes");
    expect(component.multiplierType).toEqual("pop-up");
  });

  it("onToggleDescriptor", () => {
    let result = "";
    component.toggleDescriptor.subscribe(val => result = val);
    component.onToggleDescriptor();
    expect(result).toBeTruthy();
  });

  it("onSelectRegion", () => {
    const region = ["one", "two", "three"];
    component.onSelectRegion(["one", "two", "three"]);
    expect(component.ctrlMultiple.value).toEqual(region);
  });

  it("validate", () => {
    expect(component.validate(new FormControl(true))).toEqual(component.ctrlMultiple.errors);
  });

  it("writeValue", () => {
    const value = ["one", "two", "three"];

    component.writeValue(value);
    expect(component.ctrlMultiple.value).toEqual(value);

    component.writeValue(undefined);
    expect(component.ctrlMultiple.value).toEqual(value);
  });

  it("registerOnTouched", () => {
    const value = ["one", "two", "three"];
    const mockUpdateValueAndValidity = spyOn(component.ctrlMultiple, "updateValueAndValidity").and.callThrough();

    component.ctrlMultiple.setValue(value);
    component.registerOnTouched();

    component.ctrlMultiple.setValue([]);
    component.registerOnTouched();
    expect(mockUpdateValueAndValidity).toHaveBeenCalled();
  });

  it("registerOnChange", () => {
    const fn = () => {return {}};
    component.registerOnChange(fn);
    expect(component.propagateChange).toEqual(fn);
  });

  it("should throw", () => {
    component.multiplierDataStore = null;
    expect(() => component.ngOnInit()).toThrow();
  });

  it("set ctrlSingle value", () => {
    const ctrlSingleSpy = spyOn(component.ctrlSingle, "setValue").and.callThrough();
    component.ctrlMultiple.setValue(["1"]);
    component.ngOnInit();
    expect(ctrlSingleSpy).toHaveBeenCalledWith("1");
  });

  it("multiplierTypeaheadType", () => {
    spyOn<any>(component, "getTypeaheadOptions").and.returnValue(null);
    expect(component.multiplierTypeaheadType).toEqual("");
  });

  it("multiplierSearchName", () => {
    spyOnProperty(component, "multiplierItems", "get").and.returnValue(of("name"));
    const options = {
      type: "liveSearch",
      searchName: "searchName"
    };
    spyOn<any>(component, "getTypeaheadOptions").and.returnValue(options);
    component.multiplierSearchName.subscribe(val => {
      expect(val).toEqual("searchName");
    });
  });

  it("multiplierItems", () => {
    const options = {
      type: "search",
      dataStoreRefTypeName: "name"
    };
    spyOn<any>(component,  "getTypeaheadOptions").and.returnValue(options);
    spyOn(symptomsSelectors, "typeaheadItems").and.returnValue((s) => s);
    spyOn(mockRedux, "select").and.returnValue(of({}));
    component.multiplierItems.subscribe(val => {
      expect(val).toEqual({} as any);
    });
  });

  it("ngOnInit", () => {
    (component as any).symptomData = {symptomID: "17"};
    spyOnProperty(component, "descriptorFile", "get").and.returnValue({});
    spyOn(dataService, "isActiveDescriptor$").and.returnValue(of({}));
    component.multiplierDataStore = {} as DataStoreRefType;
    component.ngOnInit();
    expect(component.descriptorToggled).toBeDefined();
  });

  it("antithesis", () => {
    component.ctrlSingle = new FormControl("selected,value");
    const selectables = [
      {
        name: "name",
        value: "value",
        m_antithesis: "antithesis"
      },
      {
        name: "name",
        value: "value",
        m_antithesis: "antithesis"
      },
      {
        name: "name",
        value: "",
        m_antithesis: "antithesis"
      }
    ];
    spyOnProperty(component, "selectables", "get").and.returnValue(selectables);
    expect(component.antithesis.length).toEqual(1);
  });

});
