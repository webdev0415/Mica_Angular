import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AppChooserComponent } from "./app-chooser.component";
import { MatCardModule } from "@angular/material";
import { AuthService } from "../../services";
import { AuthServiceStub } from "../../../test/services-stubs/auth.service.stub";
import { state } from "@angular/animations";
import { NgRedux } from "@angular-redux/store";

describe("AppChooserComponent", () => {
  let component: AppChooserComponent;
  let fixture: ComponentFixture<AppChooserComponent>;
  const mockRedux = {
    getState: () => state,
    dispatch: () => {
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppChooserComponent ],
      imports: [ MatCardModule ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
