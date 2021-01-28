// /* tslint:disable:no-unused-variable */
import { ChangeDetectorRef, Component } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { APP_BASE_HREF } from "@angular/common";
import { HeaderComponent } from "./header.component";
import { testRoutes } from "../../../test/data/test-routes";
import { RouterTestingModule } from "@angular/router/testing";
import { TestComponent } from "../../../test/test.component";
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatSidenavModule,
  MatToolbarModule
} from "@angular/material";
import { defaultState } from "../../app.config";
import { of } from "rxjs";
import { NgRedux } from "@angular-redux/store";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  @Component({
    selector: "mica-header-nav",
    template: "<div></div>"
  })
  class MockNavComponent {}

  @Component({
    selector: "mica-header-user",
    template: "<div></div>"
  })
  class MockUserComponent {}

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent,
        TestComponent,
        MockNavComponent,
        MockUserComponent
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: NgRedux, useValue: mockRedux },
        ChangeDetectorRef
      ],
      imports: [
        RouterTestingModule.withRoutes(testRoutes),
        MatSidenavModule,
        MatListModule,
        MatToolbarModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));


  it("should be created OK", async(() => {
    expect(component).toBeTruthy();
  }));
});
