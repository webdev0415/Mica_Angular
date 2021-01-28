import {TestBed, async, fakeAsync} from "@angular/core/testing";
import * as _ from "lodash";
import {SymptomService} from "./symptom.service";
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../app.config";
import * as symptomSelectors from "../state/symptoms/symptoms.selectors";
import * as symptomActions from "../state/symptoms/symptoms.actions";
import * as navSelectors from "../state/nav/nav.selectors";
import {of} from "rxjs";
import SymptomGroup = Workbench.SymptomGroup;
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import ReduxWindow = State.ReduxWindow;


describe("SymptomService", () => {
  const fakeSymptomGroups = require("../../test/data/symptom-groups.json");
  const fakeSymptoms: Symptom.Data[] = require("../../test/data/symptoms.json");

  let service: SymptomService;
  let mockBackend: HttpTestingController;
  let state = _.cloneDeep(defaultState);
  let redux: NgRedux<State.Root>;

  const mockRedux = {
    getState: (): State.Root => state,
    select: (selector) => of(selector(defaultState)),
    dispatch: (arg: any) => {
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SymptomService,
        {provide: NgRedux, useValue: mockRedux},
      ],
      imports: [HttpClientTestingModule]
    });
  });

  beforeEach(async(() => {
    mockBackend = TestBed.get(HttpTestingController);
    state = _.cloneDeep(defaultState);
    service = TestBed.get(SymptomService);
    redux = TestBed.get(NgRedux);
  }));

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("symptomGroupAll", () => {
    service.symptomGroupAll(state).subscribe(res => expect(res).toBeTruthy());
  });

  it("loadSymptomGroupAll", () => {
    const s = {...defaultState};
    Object.assign(s, {symptoms: {entities: {symptomGroups: null}}});
    expect(service["loadSymptomGroupAll"](s)).toBeDefined();
  });

  it("postMsg", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    service["postMsg"](null);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("lazyCheckDefinitions", () => {
    spyOn(service, "getSymptomDefinitions").and.returnValue(of([]));
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const sub = service.lazyCheckDefinitions().subscribe();
    expect(dispatchSpy).toHaveBeenCalled();
    sub.unsubscribe();
  });

  it("setSymptomGroups", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    spyOn(symptomSelectors, "symptomGroupVersions").and.returnValue({
      "1": 1
    });
    const symptomGroups = [
      {
        groupID: "1",
        updatedDate: 1
      } as SymptomGroup
    ];
    expect(service["setSymptomGroups"](symptomGroups).length).toEqual(0);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("loadSymptomGroupAll", () => {
    const s = {...defaultState};
    Object.assign(s, {
      symptoms: {
        entities: {
          symptomGroups: {
            "group": {
              categories: [
                "1"
              ]
            }
          }
        }
      }
    });
    spyOn(symptomSelectors, "catNameFromID").and.returnValue(() => "other");
    expect(service["loadSymptomGroupAll"](s)).toBeDefined();
  });

  it("getSymptomDefinitions", () => {
    service.getSymptomDefinitions().subscribe(data => expect(data).toEqual([]));
    mockBackend.expectOne(() => true).flush([]);
  });

  it("rehydrateSymptomGroups", () => {
    spyOn(symptomSelectors, "symptomGroupDataLoaded").and.returnValue(true);
    service.rehydrateSymptomGroups(false).subscribe(data => expect(data).toBeTruthy());
  });

  it("rehydrateSymptomGroups", () => {
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    spyOn(symptomSelectors, "symptomGroupDataLoaded").and.returnValue(true);
    spyOn<any>(service, "loadSymptomGroupAll").and.returnValue(of([{}]));
    service.rehydrateSymptomGroups(true).subscribe();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("lazyCheckWorkbenchDataVersion", () => {
    spyOn<any>(service, "loadSymptomGroupAll").and.returnValue(of([{}]));
    spyOn<any>(service, "setSymptomGroups").and.callFake(() => {});
    const postMsgSpy = spyOn<any>(service, "postMsg").and.callThrough();
    service.lazyCheckWorkbenchDataVersion().subscribe();
    expect(postMsgSpy).toHaveBeenCalled();
  });

  it("postMsg", () => {
    const sgs = [{}];
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    service["postMsg"](sgs as any);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("setSymptomGroups", () => {
    const sgs = [{
      updatedDate: "date",
      groupID: "groupId"
    }];
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    spyOn(symptomSelectors, "symptomGroupVersions").and.returnValue({});
    service["setSymptomGroups"](sgs as any);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("loadSymptomGroupAll", () => {
    spyOn(navSelectors, "symptomItemsIDs").and.callFake(() => []);
    const s = {...defaultState};
    Object.assign(state, {
      symptoms: {
        entities: {
          symptomGroups: {
            "group": {}
          }
        }
      }
    });
    spyOn<any>(service, "loadSymptomGroup").and.returnValue(of({}));
    expect(service["loadSymptomGroupAll"](s)).toBeDefined();
  });

  it("loadSymptomGroup general", () => {
    const response =  {
      groupID: "general",
      categories: [{
        categoryID: "SYMPTCG30",
      }]
    }
    service["loadSymptomGroup"]("nlp").subscribe((res: any) => {
      expect(res).toBe(response);
    })
    mockBackend.expectOne(() => true).flush(response);
    mockBackend.verify();
  });

  it("setNlpSymptoms", () => {
    const symptoms = [];
    const dispatchSpy = spyOn(redux, "dispatch").and.callThrough();
    const setNlpSymptomsSpy = spyOn(symptomActions, "setNlpSymptoms").and.callThrough();
    const response = {totalElements: 1, pagenumber: 1, content: []}
    service["setNlpSymptoms"](response);
    expect(dispatchSpy).toHaveBeenCalled();
    expect(setNlpSymptomsSpy).toHaveBeenCalledWith(response.content, 2, 1);
  });

  it("transformNlpSymptoms", () => {
    const dataStoreTemplates = [];
    const nlpSymptoms = [
      {
        dataStoreTemplates
      }
    ];
    expect(service["transformNlpSymptoms"](nlpSymptoms)[0].symptomsModel.dataStoreTypes).toEqual(dataStoreTemplates);
  });

  it("fetchNlpSymptoms", fakeAsync(() => {
    const setNlpSymptomsSpy = spyOn<any>(service, "setNlpSymptoms").and.callThrough();
    service.fetchNlpSymptoms(1).first()
      .subscribe(() => {
        expect(setNlpSymptomsSpy).toHaveBeenCalled();
      });
    mockBackend.expectOne(() => true).flush({content: [], pagenumber: 1, totalElements: 100});
  }));
});
