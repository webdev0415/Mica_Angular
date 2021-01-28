import { async, ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { CopyIllnessComponent, SelectableIllness } from "./copy-illness.component";
import { Component, EventEmitter, Input, TemplateRef } from "@angular/core";
import { DropdownContext } from "../../typeahead/dropdown/dropdown.component";
import { defaultState } from "app/app.config";
import { NgRedux } from "@angular-redux/store";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { of } from "rxjs/observable/of";
import { ModalComponent } from "../../gui-widgets/components/modal/modal.component";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import Data = Illness.Data;
import { IllnessServiceStub } from "../../../../test/services-stubs/illness.service.stub";
import { IllnessService } from "app/services";

const fakeIllnessesData: Illness.Data = require("../../../../test/data/illness-data.json");
const fakeIllnesses: Illness.Normalized.IllnessValue[] = require("../../../../test/data/illnesses.json");

const mockRedux = {
  getState: () => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};


@Component({
  selector: "mica-typeahead",
  template: "<div></div>"
})
class MockTypeaheadComponent {
  @Input() title = "";
  @Input() enableValidation = true;
  @Input() canClose = true;
  @Input() small = false;
  @Input() typeAheadMin = 2;
  @Input() valueValid: string;
  @Input() excludeItems: string[] = [];
  @Input() resultKey: "name" | "value";
  @Input() placeholder = "Search...";
  @Input() items: MICA.SelectableEl[];
  @Input() urlQuery = "";
  @Input() liveSearchType: MICA.LiveSearchType;
  @Input() templateRef: TemplateRef<DropdownContext>;
  @Input() dropdownAlignment = "left";
  @Input() sortByKey: string | string[] = "name";
  @Input() required = true;
  @Input() icd10CodeSearch: boolean;
}

describe("CopyIllnessComponent", () => {
  let component: CopyIllnessComponent;
  let fixture: ComponentFixture<CopyIllnessComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CopyIllnessComponent,
        MockTypeaheadComponent,
        ModalComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: IllnessService, useClass: IllnessServiceStub}
      ],
      imports: [
        NgbModule
      ]
    })
    .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalComponent]
        }
      }).compileComponents()
;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyIllnessComponent);
    component = fixture.componentInstance;
    component.illness = fakeIllnessesData;
    redux = TestBed.get(NgRedux);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("illnessesToCopy", () => {
    const illness = fakeIllnesses[0];
    const selectableIllnesses = [{name: illness.form.idIcd10Code, value: illness}];
    (component as any).illnesses = of(selectableIllnesses);
    component.illnessesToCopy("some_icd").subscribe(val => {
      expect(val.length).toEqual(selectableIllnesses.length);
    });
  });

  it("thereAreIllnessesToCopy", () => {
    const illness = fakeIllnesses[0];
    const selectableIllnesses = [{name: illness.form.idIcd10Code, value: illness}];
    const mockFilteredIllnesses = spyOn<any>(component, "filteredIllnesses").and.callThrough();
    (component as any).illnesses = of(selectableIllnesses);
    component.thereAreIllnessesToCopy("some_icd").subscribe(val => {
      expect(val).toEqual(true);
    });
    expect(mockFilteredIllnesses).toHaveBeenCalled();
  });

  it("filterCopyItems", () => {
    const illness = fakeIllnesses[0];
    const items = [{
      name: illness.form.idIcd10Code,
      value: illness,
      origin: "origin"
    }];
    expect(component.filterCopyItems(items, "origin")).toEqual(items);
  });

  it("onCopySelect", fakeAsync(() => {
    let res;
    const illness = fakeIllnesses[0];
    const item = {
      name: illness.form.idIcd10Code,
      value: {idIcd10Code: illness.form.idIcd10Code},
      origin: "origin"
    };
    const emitter: EventEmitter<MICA.SelectableEl> = new EventEmitter();
    const mockConfirmCopy = spyOn((component as any), "confirmCopy").and.callFake(() => {});
    emitter.subscribe(val => res = val);
    component.onCopySelect(emitter, item);
    tick();
    expect(mockConfirmCopy).toHaveBeenCalled();
    expect(res).toEqual({name: item.name, value: item.value.idIcd10Code});
  }));

  // it("confirmCopy", () => {
  //   component.isReviewer = true;
  //   component.illness = {idIcd10Code: "17"} as Data;
  //   expect(component["confirmCopy"]({name: "string", value: {idIcd10Code: "17"}})).toBeUndefined();
  // });

  it("confirmCopy", () => {
    component.isReviewer = true;
    component.illness = {idIcd10Code: "17"} as Data;
    expect(component["confirmCopy"]({name: "string", value: {idIcd10Code: "", form: {idIcd10Code: "17"}}})).toBeUndefined();
  });

  it("confirmCopy", () => {
    component.isReviewer = false;
    component.illness = {idIcd10Code: "17"} as Data;
    expect(component["confirmCopy"]({name: "string", value: {idIcd10Code: "", form: {idIcd10Code: "17"}}})).toBeUndefined();
  });

  it("trackByFn", () => {
    expect(component.trackByFn(2, null)).toEqual(2);
  });

  it("closeModal", fakeAsync(() => {
    const spyModalOpen = spyOn(component["modalService"] as any, "open").and.callThrough();
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["confirmCopy"]({name: "string", value: {idIcd10Code: "17"}});
    const modal = spyModalOpen.calls.mostRecent().returnValue;
    modal.close(true);
    tick();
    expect(mockDispatch).toHaveBeenCalled();
  }));

  it("closeModal", fakeAsync(() => {
    const spyModalOpen = spyOn(component["modalService"] as any, "open").and.callThrough();
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["confirmCopy"]({name: "string", value: {idIcd10Code: "", form: {idIcd10Code: "17"}}});
    const modal = spyModalOpen.calls.mostRecent().returnValue;
    modal.close(true);
    tick();
    expect(mockDispatch).toHaveBeenCalled();
  }));

  it("closeModal", fakeAsync(() => {
    const spyModalOpen = spyOn(component["modalService"] as any, "open").and.callThrough();
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["confirmCopy"]({name: "string", value: {idIcd10Code: "", form: {idIcd10Code: "17"}}});
    const modal = spyModalOpen.calls.mostRecent().returnValue;
    modal.dismiss("dismiss");
    tick();
    expect(mockDispatch).toHaveBeenCalled();
  }));

  it("closeModal", fakeAsync(() => {
    const spyModalOpen = spyOn(component["modalService"] as any, "open").and.callThrough();
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["confirmCopy"]({name: "string", value: {idIcd10Code: "", form: {idIcd10Code: "17"}}});
    const modal = spyModalOpen.calls.mostRecent().returnValue;
    modal.dismiss("Cross click");
    tick();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(component.edit).toBeFalsy();
  }));

  it("illnesses", () => {
    spyOnProperty(component, "illnessValues", "get").and.returnValue(of([{form: {idIcd10Code: "code"}}]));
    component.ngOnInit();
    (<any>component)["illnesses"].subscribe(val => {
      expect(val[0].name).toEqual("code");
    });
  });

  it("denormalizeIllnesses", () => {
    spyOn<any>(component, "denormalizeIllness").and.callFake(illness => illness);
    const illnesses = [{}] as SelectableIllness[];
    expect(component["denormalizeIllnesses"](illnesses)).toEqual(illnesses);
  });

  it("denormalizeIllness", () => {
    const illness = {
      name: "illness",
      value: {
        entities: {},
        form: {}
      }
    } as SelectableIllness;
    expect(component["denormalizeIllness"](illness)).not.toEqual(illness);
  });

});
