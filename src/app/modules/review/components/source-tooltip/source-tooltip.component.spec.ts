import * as _ from 'lodash';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SourceTooltipComponent } from './source-tooltip.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux } from '@angular-redux/store';
import { defaultState } from 'app/app.config';
import * as sourceSelectors from 'app/state/source/source.selectors';

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: (): State.Root => state,
  dispatch: (arg: any) => {
  }
};
describe('ReviewSubmitComponent', () => {
  let component: SourceTooltipComponent;
  let fixture: ComponentFixture<SourceTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SourceTooltipComponent,
      ],
      providers: [
        {provide: NgRedux, useValue: mockRedux},
      ],
      imports: [
        NgbModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceTooltipComponent);
    component = fixture.componentInstance;
    component.info = {} as Symptom.RowValue;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getSourceInfo', () => {
    spyOn(sourceSelectors, 'selectSymptomSourceByID'). and.returnValue(() => ({ source: 'Source', sourceType: 'Type' }));
    expect(component.getSourceInfo(null))
      .toEqual([]);
    expect(component.getSourceInfo({} as Symptom.RowValue))
      .toEqual([]);
    expect(
      component.getSourceInfo({
        sourceInfo: [ { sourceID: 23, addedBy: 'Doctor', enable: true, sourceRefDate: +new Date(1) }]
      } as Symptom.RowValue)
    ).toEqual(['Source: Source', 'Type: Type', 'Date: ' + new Date(1).toLocaleDateString()]);

    expect(
      component.getSourceInfo({ sourceInfo: [{ sourceID: 23, addedBy: 'Doctor', enable: true }] } as Symptom.RowValue)
    ).toEqual(['Source: Source', 'Type: Type']);
  });

  it('getSourceInfo', () => {
    spyOn(sourceSelectors, 'selectSymptomSourceByID'). and.returnValue(() => ({}));
    expect(component.getSourceInfo({ sourceInfo: [{}] } as Symptom.RowValue).length).toEqual(0);
  });

});
