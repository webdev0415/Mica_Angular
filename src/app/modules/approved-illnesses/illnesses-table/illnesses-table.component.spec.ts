import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IllnessesTableComponent } from "./illnesses-table.component";
import {NgbDropdownModule, NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {IllnessService} from "../../../services";
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../../../app.config";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {IllnessServiceStub} from "../../../../test/services-stubs/illness.service.stub";
import {of} from "rxjs";

const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};

describe("IllnessesTableComponent", () => {
  let component: IllnessesTableComponent;
  let fixture: ComponentFixture<IllnessesTableComponent>;
  let service: IllnessService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbPaginationModule,
        NgbDropdownModule,
        HttpClientTestingModule
      ],
      declarations: [ IllnessesTableComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: IllnessService, useClass: IllnessServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IllnessesTableComponent);
    component = fixture.componentInstance;
    (component as any).symptomData = {
      symptomID: "17",
      symptomName: "symptom"
    };
    service = TestBed.get(IllnessService);
    fixture.detectChanges();
  });

  it("ngOnInit", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    component.symptomData = {
      symptomID: null
    };
    const getIllnessDataSpy = spyOn(component, "getIllnessesData").and.callThrough();
    component.ngOnInit();
    expect(getIllnessDataSpy).not.toHaveBeenCalled();
  });

  it("setPageSize", () => {
    const size = 0;
    component.pageSize = size;
    expect(component.setPageSize(size)).toBeUndefined();
  });

  it("setPageSize", () => {
    const size = 0;
    component.pageSize = 1;
    const changePageSpy = spyOn(component, "changePage").and.callThrough();
    component.setPageSize(size);
    expect(component.pageSize).toEqual(size);
    expect(changePageSpy).toHaveBeenCalled();
  });

  it("getIllnessesData", () => {
    spyOn(service, "getApprovedIllnesses").and.returnValue(of({
      content: null,
      totalElements: 1
    }));
    const prevIllnessData = component.illnessData;
    component.getIllnessesData();
    expect(component.illnessData).toEqual(prevIllnessData);
  });

  it("ngOnChanges", () => {
    const changes = {
      symptomData: {
        previousValue: null
      }
    };
    expect(component.ngOnChanges(changes as any)).toBeUndefined();
  });

  it("ngOnChanges", () => {
    const symptomData = {
      symptomID: "",
      symptomName: "name"
    };
     const changes = {
       symptomData: {
         previousValue: symptomData,
         currentValue: symptomData
       }
     };
     const getIllnessesDataSpy = spyOn(component, "getIllnessesData").and.callThrough();
     component.ngOnChanges(changes as any);
     expect(getIllnessesDataSpy).not.toHaveBeenCalled();
  });

  it("ngOnChanges", () => {
    const symptomData = {
      symptomID: "symptomID",
      symptomName: "name"
    };
     const changes = {
       symptomData: {
         previousValue: symptomData,
         currentValue: symptomData
       }
     };
     const getIllnessesDataSpy = spyOn(component, "getIllnessesData").and.callThrough();
     component.ngOnChanges(changes as any);
     expect(getIllnessesDataSpy).not.toHaveBeenCalled();
  });

  it("ngOnChanges", () => {
    const prevSymptomData = {
      symptomID: "prevSymptomID",
      symptomName: "prevName"
    };
    const currSymptomData = {
      symptomID: "symptomID",
      symptomName: "name"
    };
     const changes = {
       symptomData: {
         previousValue: prevSymptomData,
         currentValue: currSymptomData
       }
     };
     const getIllnessesDataSpy = spyOn(component, "getIllnessesData").and.callThrough();
     component.ngOnChanges(changes as any);
     expect(getIllnessesDataSpy).toHaveBeenCalled();
  });
});
