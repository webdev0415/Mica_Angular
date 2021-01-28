import * as _ from "lodash";
import { TestBed, fakeAsync } from "@angular/core/testing";
import { SvgShapesService } from "./svgShapes.service";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

describe("SvgShapesService", () => {
  let service: SvgShapesService;
  let mockBackend: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SvgShapesService,
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.get(SvgShapesService);
    mockBackend = TestBed.get(HttpTestingController);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getShapesByGroup physical", fakeAsync(() => {
    const response: object = {};
    service.getShapesByGroup("physical").subscribe(res => {
      expect(res).toEqual(response);
    })
    mockBackend.expectOne(() => true).flush(response);
    mockBackend.verify();
  }))

  it("getShapesByGroup pain", fakeAsync(() => {
    const response: object = {};
    service.getShapesByGroup("pain").subscribe(res => {
      expect(res).toEqual(response);
    })
    mockBackend.expectOne(() => true).flush(response);
    mockBackend.verify();
  }))

  it("getShapesByGroup general", fakeAsync(() => {
    service.getShapesByGroup("general").subscribe(res => {
      expect(res).toEqual(null);
    })
  }))
})
