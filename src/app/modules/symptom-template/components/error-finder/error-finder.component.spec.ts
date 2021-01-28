import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorFinderComponent } from './error-finder.component';
import {KeysPipe} from "../../../pipes/keys.pipe";
import {PageSpinnerComponent} from "../../../spinner/page-spinner/page-spinner.component";
import {TemplateService} from "../../../../services/template.service";
import {TemplateServiceStub} from "../../../../../test/services-stubs/template.service.stub";
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../../../../app.config";
import {Observable} from "rxjs";
import {Router} from "@angular/router";
import {of} from "rxjs/observable/of";

const mockRedux = {
  getState: () => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

describe('ErrorFinderComponent', () => {
  let component: ErrorFinderComponent;
  let fixture: ComponentFixture<ErrorFinderComponent>;
  let redux: NgRedux<State.Root>;
  let svc: TemplateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ErrorFinderComponent,
        KeysPipe,
        PageSpinnerComponent
      ],
      providers: [
        { provide: TemplateService, useClass: TemplateServiceStub },
        { provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorFinderComponent);
    redux = TestBed.get(NgRedux);
    svc = TestBed.get(TemplateService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should return index', () => {
    const index = 1;
    expect(component.trackByFn(index, {} as Symptom.TemplateError)).toEqual(index);
  });

  it('should test onEditSymptom', () => {
    const symptomId = "17";
    const ev = new Event('click');
    const getTemplate = spyOn(svc, 'getTemplate').and.callThrough();
    const preventDefault = spyOn(ev, "preventDefault").and.callThrough();
    component.onEditSymptom(symptomId, ev);
    expect(preventDefault).toHaveBeenCalled();
    expect(getTemplate).toHaveBeenCalledWith(symptomId);
  });

  it("onEditSymptom", () => {
    spyOn(svc, "getTemplate").and.returnValue(of(null));
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component.onEditSymptom("17", {preventDefault: () => {}} as Event);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
