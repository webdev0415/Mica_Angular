import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ApprovedIllnessesComponent } from "./approved-illnesses.component";
import {SymptomSearchComponent} from "./symptom-search/symptom-search.component";
import {SpinnerModule} from "../spinner/spinner.module";
import {NgbDropdownModule, NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {ReactiveFormsModule} from "@angular/forms";
import {IllnessesTableComponent} from "./illnesses-table/illnesses-table.component";
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../../app.config";

const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};

describe("ApprovedIllnessesComponent", () => {
  let component: ApprovedIllnessesComponent;
  let fixture: ComponentFixture<ApprovedIllnessesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SpinnerModule,
        NgbPaginationModule,
        NgbDropdownModule,
        ReactiveFormsModule
      ],
      declarations: [
        ApprovedIllnessesComponent,
        SymptomSearchComponent,
        IllnessesTableComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovedIllnessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
