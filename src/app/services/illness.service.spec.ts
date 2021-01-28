import { TestBed, async } from "@angular/core/testing";
import * as _ from "lodash";
import { IllnessService } from "./illness.service";
import { Router } from "@angular/router";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "app/app.config";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import * as symptomFactory from "../modules/symptom/symptom.factory";
const fakeIllnesses = require("../../test/data/illnesses.json");
const state = _.cloneDeep(defaultState);
const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};
const mockRedux = {
  getState: (): State.Root => state,
  dispatch: (arg: any) => {
  }
};

describe("IllnessService", () => {
  let service: IllnessService;
  let mockBackend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IllnessService,
        { provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter }
      ],
      imports: [HttpClientTestingModule]
    });
  });

  beforeEach(async(() => {
    service = TestBed.get(IllnessService);
    mockBackend = TestBed.get(HttpTestingController);
  }));

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("syncIllnessData", () => {
    const illness = fakeIllnesses[0];
    const response = {
      status: "OK",
      count: 1,
      icd10CodesStatus: [illness.form.idIcd10Code]
    };
    const prepareIllnessForSavingSpy = spyOn<any>(service, "prepareIllnessForSaving").and.callFake(val => val);

    service.syncIllnessData(illness.form).subscribe(data => expect(data).toEqual(response), err => expect(err).toBeDefined());
    mockBackend.expectOne(() => true).flush(response);
    mockBackend.verify();
    expect(prepareIllnessForSavingSpy).toHaveBeenCalled();
  });

  it("updateIllStatus", () => {
    const illness = fakeIllnesses[0];
    const payloadItem = {
      userID: 1,
      fromState: state.global.illStates.pending,
      toState: state.global.illStates.rejected,
      rejectionReason: "reason",
      icd10Code: illness.form.idIcd10Code,
      version: illness.form.version
    };
    const payload = [payloadItem];
    const response = {
      count: payload.length,
      idIcd10Codes: [payloadItem.icd10Code]
    };

    service.updateIllStatus(payload).subscribe(data => expect(data).toEqual(response as any));
    mockBackend.expectOne(() => true).flush(response);
    mockBackend.verify();
  });

  it("getUserIllnessSavedByState", () => {
    const illness = fakeIllnesses[0];
    const response = { userData: [illness.form] };

    service.getUserIllnessSavedByState([state.global.illStates.pending]).subscribe(data => expect(data).toEqual(response.userData));
    mockBackend.expectOne(() => true).flush(response);
    mockBackend.verify();
  });

  it("parseResponse", () => {
    const response = {
      body: ""
    };

    expect(service["parseResponse"](response as any)).toEqual("");
  });

  it("parseResponse", () => {
    expect(() => service["parseResponse"](null)).toThrow();
  });

  it("getIllnesses", () => {
    expect(service.getIllnesses()).toBeDefined();
  });

  it("getApprovedIllnesses", () => {
    expect(service.getApprovedIllnesses("id", 1, 1)).toBeDefined();
  });

  it("searchIllnesses", () => {
    const illnesses = [];

    service.searchIllnesses("").subscribe(ills => {
      expect(ills).toEqual(illnesses);
    });
    mockBackend.expectOne(() => true).flush(illnesses);
  });

  it("prepareIllnessForSaving", () => {
    const illness: Illness.FormValue = fakeIllnesses[0].form;
    const optimizeSymptomValueSpy = spyOn(symptomFactory, "optimizeSymptomValue").and.callFake(() => {});

    illness.symptomGroups = [
      <any>{
        categories: [
          { symptoms: [{}] },
        ]
      }
    ];
    service["prepareIllnessForSaving"](illness);
    expect(optimizeSymptomValueSpy).toHaveBeenCalledTimes(illness.symptomGroups[0].categories[0].symptoms.length);
  });

});
