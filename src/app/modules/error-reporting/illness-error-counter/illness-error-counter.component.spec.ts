import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IllnessErrorCounterComponent } from './illness-error-counter.component';
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../../../app.config";
import {TOGGLE_ILLNESS_ERRORS} from "../../../state/nav/nav.actions";
import {of} from "rxjs/observable/of";

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

describe('IllnessErrorCounterComponent', () => {
  let component: IllnessErrorCounterComponent;
  let fixture: ComponentFixture<IllnessErrorCounterComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IllnessErrorCounterComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    fixture = TestBed.createComponent(IllnessErrorCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('onToggleErrors should dispatch toggle state', () => {
    const mockDispatch = spyOn(redux, 'dispatch').and.callThrough();
    component.onToggleErrors();
    expect(mockDispatch).toHaveBeenCalledWith({type: TOGGLE_ILLNESS_ERRORS});
  });
  it("getSymptomsCount", () => {
    const errs = {
      symptoms: {
        "symptom": [
          {
            name: "name"
          },
          {
            name: "sympt name"
          }
        ]
      }
    } as any;
    expect(component["getSymptomsCount"](errs)).toEqual(2);
  });

  it("getTasksCount ", () => {
    const errs = {
      illness: {
        name: "name"
      },
      symptoms: {
        "symptom": [
          {
            name: "name"
          },
          {
            name: "sympt name"
          }
        ]
      }
    } as any;
    expect(component["getTasksCount"](errs)).toEqual(3);
  });
});
