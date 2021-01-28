/* tslint:disable:no-unused-variable */
import {
  async,
  fakeAsync,
  ComponentFixture,
  TestBed, tick
} from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NavComponent } from "./nav.component";
import {NgRedux, NgReduxModule} from "@angular-redux/store";
import {TemplatesComponent} from "../templates/templates.component";
import {SymptomsComponent} from "../symptoms/symptoms.component";
import {InspectorComponent} from "../inspector/inspector.component";
import { EcwReviewsComponent } from '../ecw-reviews/ecw-reviews.component';
import {IllnessService} from "../../../../services/illness.service";
import {IllnessServiceStub} from "../../../../../test/services-stubs/illness.service.stub";
import {NgReduxTestingModule} from "@angular-redux/store/testing";
import {defaultState, navInit} from "../../../../app.config";
import {TreatmentsComponent} from "../treatments/treatments.component";
import {changeNavBar} from "../../../../state/nav/nav.actions";
import {testRoutes} from "../../../../../test/data/test-routes";
import {TestComponent} from "../../../../../test/test.component";
import {CorrectSpellingPipe} from "../../../pipes/correct-spelling.pipe";
const fakeUsers = require("../../../../../test/data/users.json");
import { GroupsComponent } from "../groups/groups.component";

describe("NavComponent", () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let illnessService: IllnessServiceStub;
  const mockRedux = {
    getState: () => {
      return {
        user: fakeUsers[0],
        nav: navInit
      }
    },
    dispatch: (arg: any) => {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NavComponent,
        TemplatesComponent,
        SymptomsComponent,
        TreatmentsComponent,
        InspectorComponent,
        EcwReviewsComponent,
        TestComponent,
        CorrectSpellingPipe,
        GroupsComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: NgReduxModule, useClass: NgReduxTestingModule},
        { provide: IllnessService, useClass: IllnessServiceStub }
      ],
      imports: [RouterTestingModule.withRoutes(testRoutes)]
    })
      .compileComponents()
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create and destroy OK", () => {
    expect(component).toBeTruthy();
    component.ngOnDestroy();
  });

  it("default navBar should be  \"symptoms\"", () => {
    const subs = component["subs"];
    expect(component.activeNavBar).toEqual("symptoms");
  });

  it("should change state", fakeAsync(() => {
    const dispatch = spyOn(component['s'], 'dispatch').and.callThrough();
    component['router'].navigate(['treatments']);
    tick();
    expect(dispatch).toHaveBeenCalledWith(changeNavBar('treatments'));
    component['router'].navigate(['']);
    tick();
    expect(dispatch).toHaveBeenCalledWith(changeNavBar('symptoms'));
  }));

  it("parceUrl",  () => {
    expect(component.parceUrl("/templates")).toEqual("templates");
    expect(component.parceUrl("/inspector")).toEqual("inspector");
    // expect(component.parceUrl("/ecw-reviews")).toEqual("ecw reviews");
    expect(component.parceUrl("/groups")).toEqual("groups");
  });

  it("activeNavBar", () => {
    const s = {...defaultState};
    Object.assign(s, {nav: {navBar: null}});
    spyOnProperty<any>(component, "state", "get").and.returnValue(s);
    expect(component.activeNavBar).toEqual("symptoms");
  });
});

