import { TestBed } from "@angular/core/testing";
import { LaborderService } from "./laborder.service";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { defaultState } from "app/app.config";
import * as _ from "lodash";
import { NgRedux } from "@angular-redux/store";

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: () => state,
  dispatch: () => {
  }
};

describe("LaborderService", () => {
  let service: LaborderService;
  let mockBackend: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
      providers: [
        LaborderService,
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(LaborderService);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("state", () => {
    expect(service["state"]).toEqual(state);
  });

  it("getLabOrders", () => {
    const laborders = [
      { name: "one", orderID: 1 },
    ];

    service.getLabOrders().subscribe(res => expect(res).toEqual(laborders));
    mockBackend.expectOne(() => true).flush(laborders);
    mockBackend.verify();
  });
});
