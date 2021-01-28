import {RouteResolverService} from "./route-resolver.service";
import {TestBed} from "@angular/core/testing";
import {EditorLoaderService} from "./editor-loader.service";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Observable} from "rxjs/Observable";
const editorLoaderServiceStub = {
  dispatchSymptomGroup: (symptomGroup: string) => { return true }
};
describe("RouteResolverService", () => {
  let service: RouteResolverService;
  let editorLoaderService: EditorLoaderService;
  let mockBackend: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RouteResolverService,
        {provide: EditorLoaderService, useValue: editorLoaderServiceStub}
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.get(RouteResolverService);
    editorLoaderService = TestBed.get(EditorLoaderService);
    mockBackend = TestBed.get(HttpTestingController);

  });
  it("resolve", () => {
    const url = "a/b/c/c?d";
    expect(service.resolve({} as ActivatedRouteSnapshot, {url: url} as any)).toBeTruthy();
  });
  it("resolve", () => {
    const url = "a/b/c/c/?d";
    expect(service.resolve({} as ActivatedRouteSnapshot, {url: url} as any)).toBeFalsy();
  });

  it("resolve", () => {
    const sgName = "physical";
    const url = `/workbench/${sgName}?`;
    const state = {
      url: url
    } as RouterStateSnapshot;
    const route = {} as ActivatedRouteSnapshot;
    const physicalShapes = {} as MICA.BodyImage.ViewSVGMap;

    spyOn(editorLoaderService, "dispatchSymptomGroup").and.callFake(() => {});
    (service.resolve(route, state) as Observable<any>).subscribe(value => {
      expect(value).toEqual(physicalShapes);
    });
    mockBackend.expectOne(() => true).flush(physicalShapes);
  });

  it("resolve", () => {
    const sgName = "pain";
    const url = `/workbench/${sgName}?`;
    const state = {
      url: url
    } as RouterStateSnapshot;
    const route = {} as ActivatedRouteSnapshot;
    const painShapes = {} as MICA.BodyImage.ViewSVGMap;

    spyOn(editorLoaderService, "dispatchSymptomGroup").and.callFake(() => {});
    (service.resolve(route, state) as Observable<any>).subscribe(value => {
      expect(value).toEqual(painShapes);
    });
    mockBackend.expectOne(() => true).flush(painShapes);
  });
});
