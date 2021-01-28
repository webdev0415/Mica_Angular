import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Subscription } from 'rxjs';
import { SpinnerModule } from "../../../spinner/spinner.module";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { NgRedux} from "@angular-redux/store";
import { defaultState } from "../../../../app.config";
import { EcwEditorComponent } from './ecw-editor.component';


const mockRouter = {
  navigate: jasmine.createSpy("navigate")
};
const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};


@Component({
  selector: 'ecw-symptom-groups',
  template: '<div></div>'
})
class MockEcwSymptomGroupsComponent {
  @Input() userData: any;
}

describe('EcwEditorComponent', () => {
  let component: EcwEditorComponent;
  let fixture: ComponentFixture<EcwEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SpinnerModule
      ],
      declarations: [
        EcwEditorComponent,
        MockEcwSymptomGroupsComponent
      ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter },
      ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcwEditorComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit", () => {
    spyOnProperty<any>(component, "state", "get").and.returnValue({ecw: {active: {icd10Code: "17"}}});
    component.ngOnInit();
    expect(component.loadingData).toEqual(false);
  });


});
