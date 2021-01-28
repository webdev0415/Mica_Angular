import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IllnessValueComponent } from "./illness-value.component";
import { defaultState } from "app/app.config";
import { NgRedux } from "@angular-redux/store";
import { of } from "rxjs/observable/of";

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

describe("IllnessValueComponent", () => {
  let component: IllnessValueComponent;
  let fixture: ComponentFixture<IllnessValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IllnessValueComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IllnessValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("bodyPartsError", () => {
    const mockSenseOfMessage = spyOn((component as any), "makeSenseOfMessage").and.returnValue([]);
    component.bodyPartsError({});
    expect(mockSenseOfMessage).toHaveBeenCalledWith({bodyParts: {}});
  });

  it("symptomRootError", () => {
    const mockSenseOfMessage = spyOn((component as any), "makeSenseOfMessage").and.callFake(() => {});
    component.symptomRootErrors({index: 1});
    expect(mockSenseOfMessage).toHaveBeenCalledWith({});
  });

  it("modifierRootErrors", () => {
    const mockSenseOfMessage = spyOn((component as any), "makeSenseOfMessage").and.callFake(() => {});
    component.modifierRootErrors({
      index: 1,
      name: "name"
    });
    expect(mockSenseOfMessage).toHaveBeenCalledWith({});
  });

  it("scaleErrors", () => {
    const mockSenseOfMessage = spyOn((component as any), "makeSenseOfMessage").and.callFake(() => {});
    component.scaleErrors({});
    expect(mockSenseOfMessage).toHaveBeenCalledWith({});
  });

  it("makeSenseOfMessage", () => {
    let res = (component as any).makeSenseOfMessage({error: {length: "short"}});
    expect(res[0]).toContain("too short");

    res = (component as any).makeSenseOfMessage({error: {length: "long"}});
    expect(res[0]).toContain("too long");

    res = (component as any).makeSenseOfMessage({error: {length: "wrong"}});
    expect(res[0]).toContain("wrong length");

    res = (component as any).makeSenseOfMessage({error: {type: "wrong"}});
    expect(res[0]).toContain("wrong type");

    res = (component as any).makeSenseOfMessage({error: {pattern: "wrong"}});
    expect(res[0]).toContain("valid value");

    res = (component as any).makeSenseOfMessage({error: {required: "yes"}});
    expect(res[0]).toContain("is required");

    const msg = "it\'s an error dude!";
    res = (component as any).makeSenseOfMessage({error: {msg: msg}});
    expect(res[0]).toContain(msg);
  });

  it("illRootErrors", () => {
    const illErrors = of({illness: {groupsComplete: "completed groups"}});
    spyOnProperty(component, "illErrors", "get").and.returnValue(illErrors);
    component.illRootErrors.subscribe(errs => {
      expect(errs.length).toBeGreaterThan(0);
    });
  });

  it("illRootErrors", () => {
    const illErrors = of({illness: {groupsIncomplete: "incompleted groups"}});
    spyOnProperty(component, "illErrors", "get").and.returnValue(illErrors);
    component.illRootErrors.subscribe(errs => {
      expect(errs.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("scaleErrors", () => {
    spyOn<any>(component, "makeSenseOfMessage").and.returnValue(["scale"]);
    expect(component.scaleErrors(null)[0]).toEqual("Scale scale");
  });

  it("getKeys", () => {
    expect(component["getKeys"]({err: "err"})[0]).toEqual("err");
  });
});
