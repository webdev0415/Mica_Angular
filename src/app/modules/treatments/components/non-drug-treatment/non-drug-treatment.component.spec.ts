import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NonDrugTreatmentComponent } from './non-drug-treatment.component';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { defaultState } from 'app/app.config';
import { MockTreatmentGroupComponent, MockTypeaheadComponent } from '../../../../../test/components-stubs';
import * as treatmentsActions from '../../state/treatments.actions';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { TreatmentApiServiceStub } from '../../../../../test/services-stubs/treatment-api-service-stub.service';

const mockRedux = {
  getState: (): State.Root => {
    return _.cloneDeep(defaultState)
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

describe('NonDrugTreatmentComponent', () => {
  let component: NonDrugTreatmentComponent;
  let fixture: ComponentFixture<NonDrugTreatmentComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        MatIconModule,
        MatDialogModule,
        DragDropModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        NonDrugTreatmentComponent,
        MockTypeaheadComponent,
        MockTreatmentGroupComponent
      ],
      providers: [
        provideMockStore({ initialState: defaultState }),
        { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub },
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(MockStore);
    fixture = TestBed.createComponent(NonDrugTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle drug-n-drop (drop)', () => {
    const deleteNonDrugSpy = spyOn(<any>component, 'deleteNonDrug').and.callFake(() => {});
    const updateTreatmentsSpy = spyOn(<any>component, 'updateTreatments').and.callFake(() => {});
    const event: any = {
      isPointerOverContainer: true,
      previousContainer: { id: 'test' },
      container: { id: 'test' },
      previousIndex: 0,
      currentIndex: 1
    };

    event.container.data = [ { typeDescID: 'a' }, { typeDescID: 'b' } ];
    component.drop(<any>event, 0);
    expect(deleteNonDrugSpy).not.toHaveBeenCalled();
    expect(event.container.data[0].typeDescID).toEqual('b');
    expect(updateTreatmentsSpy).toHaveBeenCalled();

    event.isPointerOverContainer = false;
    event.previousContainer.id = 'double_test';
    event.previousContainer.data = [ { typeDescID: 'c' } ];
    event.currentIndex = 0;
    component.drop(<any>event, 0);
    expect(deleteNonDrugSpy).toHaveBeenCalled();
    expect(event.container.data[0].typeDescID).toEqual('c');
  });

  it('deleteNonDrug', () => {
    const dispatchSpy = spyOn((<any>component).store, 'dispatch').and.callFake(() => {});

    component.deleteNonDrug(0, 0);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should delete group (deleteGroup)', () => {
    const updateTreatmentsSpy = spyOn(<any>component, 'updateTreatments').and.callFake(() => {});

    (<any>component).groups = [ { groupName: 'a' } ];
    component.deleteGroup(0);

    expect(updateTreatmentsSpy).toHaveBeenCalled();
    expect(updateTreatmentsSpy.calls.mostRecent().args[0].length).toEqual(0);
  });

  it('should dispatch treatments update (updateTreatments)', () => {
    const setActiveTreatmentsRecordGroupsSpy = spyOn(treatmentsActions, 'setActiveTreatmentsRecordGroups').and.callFake(() => {});
    const dispatchSpy = spyOn(store, 'dispatch').and.callFake(() => {});

    (<any>component).updateTreatments([]);
    expect(setActiveTreatmentsRecordGroupsSpy).toHaveBeenCalledWith({ template: component.template, groups: [] });
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should save changes', () => {
    const updateTreatmentsSpy = spyOn(<any>component, 'updateTreatments').and.callFake(() => {});

    component.saveChanges();
    expect(updateTreatmentsSpy).toHaveBeenCalledWith(component.groups);
  });

});
