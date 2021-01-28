import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EcwSymptomReviewComponent } from './ecw-symptom-review.component';
import { PipesModule } from "../../../pipes/pipes.module";
import { GuiWidgetsModule } from "../../../gui-widgets/gui-widgets.module";
import { NgRedux} from "@angular-redux/store";
import { defaultState } from "../../../../app.config";

const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};

describe('EcwSymptomReviewComponent', () => {
  let component: EcwSymptomReviewComponent;
  let fixture: ComponentFixture<EcwSymptomReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        PipesModule,
        GuiWidgetsModule
      ],
      declarations: [ 
        EcwSymptomReviewComponent
      ],
      providers: [ { provide: NgRedux, useValue: mockRedux } ]
    })    
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcwSymptomReviewComponent);
    component = fixture.componentInstance;
    component.symptomsIDs = [];
    component.categoryID = "";
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  
  it('should trackByFn', () => {
    expect(component.trackByFn(1, {bias: true} as Symptom.RowValue)).toEqual(1);
  });

  it('should rowValues', () => {
    expect(component.rowValues({bias: true} as Symptom.RowValue)).toEqual(["", "true", ""]);
    expect(component.rowValues({name: "Age", likelihood: "val"})).toEqual([]);
  });

  it('should modifierDisplayValues', () => {
    expect(component.modifierDisplayValues({bias: true} as Symptom.RowValue)).toEqual([]);
    expect(component.modifierDisplayValues({name: "Ethnicity", likelihood: "val"})).toEqual(["", "", "val", "Ethnicity", ""]);
    expect(component.modifierDisplayValues({name: "Age", likelihood: "val"})).toEqual(["", "", "val", "Age", "", "", "", "", ""]);
  });

  it('should calculateRows', () => {
    const row: Symptom.RowValue = {bias: true} as Symptom.RowValue;
    expect(component.calculateRows([row])).toEqual([row]);

    row.modifierValues = [{name: "Ethnicity", likelihood: "val"}];
    expect(component.calculateRows([row])).toEqual([row, row.modifierValues[0]]);
  });

});
