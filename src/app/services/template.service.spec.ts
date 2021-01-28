import { TestBed, inject } from "@angular/core/testing";
import * as _ from "lodash";

import { TemplateService } from "./template.service";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../app.config";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import Template = Symptom.Template;

const fakeTemplates = require("../../test/data/templates.json");
const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe("TemplateService", () => {
  let service: TemplateService;
  let mockBackend: HttpTestingController;
  let redux: NgRedux<State.Root>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TemplateService,
        {provide: NgRedux, useValue: mockRedux},
      ],
      imports: [RouterTestingModule, HttpClientTestingModule]
    });

    service = TestBed.get(TemplateService);
    mockBackend = TestBed.get(HttpTestingController);
    redux = TestBed.get(NgRedux);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getTemplate", () => {
    const template = fakeTemplates[0];
    const symptomID = template.symptomID;

    service.getTemplate(symptomID)
      .subscribe(res => expect(res).toEqual(template));
    mockBackend.expectOne(() => true).flush(template);
    mockBackend.verify();
  });

  it("saveTemplate without groupID", () => {
    const template = {...fakeTemplates[0]};

    template.groupID = null;
    service.saveTemplate(template).subscribe(() => true);
    mockBackend.expectOne(req => {
      return _.isEqual(req.body.groupID, template.groupID);
    });
    mockBackend.verify();

    template.groupID = "";
    service.saveTemplate(template).subscribe(() => true);
    mockBackend.expectOne(req => {
      return _.isEqual(req.body.groupID, null);
    });
    mockBackend.verify();

    template.groupID = "2,3";
    service.saveTemplate(template).subscribe(() => true);
    mockBackend.expectOne(req => {
      return _.isEqual(req.body.groupID, [2, 3]);
    });
    mockBackend.verify();
  });

  it("saveTemplate with labsorder", () => {
    const template = {...fakeTemplates[0]};

    template.labsOrdered = "test1,test2";
    service.saveTemplate(template).subscribe(() => true);
    mockBackend.expectOne(req => {
      return _.isEqual(req.body.labsOrdered, ["test1","test2"]);
    });
    mockBackend.verify();
  });

  it("saveTemplate without labsorder", () => {
    const template = {...fakeTemplates[0]};
    service.saveTemplate(template).subscribe(() => true);
    mockBackend.expectOne(req => {
      return !_.has(req.body, "labsOrdered");
    });
    mockBackend.verify();

    template.labsOrdered = "";
    service.saveTemplate(template).subscribe(() => true);
    mockBackend.expectOne(req => {
      return _.isEqual(req.body.labsOrdered, null);
    });
    mockBackend.verify();
  });

  it("get errors", () => {
    const error = {
      name: "name",
      symptomID: "someID",
      dataInvalidAttributes: ["first", "second", "third"],
      multiplier: {
        first: ["first"]
      }
    };

    service.errors
      .subscribe(res => expect(res).toEqual([error]));
    mockBackend.expectOne(() => true).flush([error]);
    mockBackend.verify();
  });

  it("editSymptomTemplate", () => {
    expect(service.editSymptomTemplate(null, null)).toBeUndefined();
  });

  it("editSymptomTemplate", () => {
    const getTemplateSpy = spyOn(service, "getTemplate").and.callThrough();

    service.editSymptomTemplate("17", "17");
    expect(getTemplateSpy).toHaveBeenCalled();
  });

  it("upgradeSymptomTemplates", () => {
    const dispatchSpy = spyOn(redux, "dispatch");

    service["upgradeSymptomTemplates"]("field", {} as Template);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("mapData", () => {
    const value = "sV";

    expect(service["mapData"](value)).toEqual("s V");
  });

  it("handleTemplateErrors", () => {
    const body = [
      {
        dataInvalidAttributes: [
          "ES_Question",
          "Questions"
        ]
      },
      {
        dataInvalidAttributes: null
      }
    ];
    const res = {
      body: JSON.stringify(body)
    };

    expect(service["handleTemplateErrors"](res as any)).toBeDefined();
  });

  it("handleTemplateErrors", () => {
    const body = [
      {
        dataInvalidAttributes: [
          "ES_Question",
          "Questions"
        ]
      },
      {
        dataInvalidAttributes: null
      }
    ];
    const res = {
      body: ""
    };

    expect(service["handleTemplateErrors"](res as any)).toBeDefined();
  });

});
