import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  EventEmitter,
  Output, OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { NgRedux } from '@angular-redux/store';
import { removeDrug, saveDrug, setActiveTreatmentsRecordGroups } from 'app/modules/treatments/state/treatments.actions';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import Description = Treatments.Drug.Description;
import { Store } from '@ngrx/store';
import { isPrescriptionDrug } from '../../../../util/isPrescriptionDrug';
import { DrugDialogComponent } from './drug-dialog/drug-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mica-drug-treatment',
  templateUrl: './drug-treatment.component.html',
  styleUrls: ['./drug-treatment.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class DrugTreatmentComponent implements OnDestroy {
  @Input() template: Treatments.Types.Template;
  @Input() readonly groups: Treatments.Drug.Group[];
  @Output() treatmentChange: EventEmitter<string> = new EventEmitter();

  helpText = 'You can create a group by clicking the button to the left.' +
    ' If you would like to change the name of a group simply click on it.' +
    ' The items in each list can also be dragged and dropped into the correct positioning.' +
    ' You can also Delete them by dragging them out of a box.';

  private destroy$: Subject<void> = new Subject();

  constructor(private matDialog: MatDialog,
              private cd: ChangeDetectorRef,
              private treatmentService: TreatmentsApiService,
              private s: NgRedux<State.Root>,
              private store: Store<State.Root>) { }


  get isPrescriptionDrug(): boolean {
    return isPrescriptionDrug(this.template.typeID);
  }

  openDrugForm(editPayload?: { drugToEdit: Treatments.Drug.Description, atcGroup: Treatments.AtcGroup } ) {
    const modal = this.matDialog.open(DrugDialogComponent);

    modal.componentInstance.isPrescription = this.isPrescriptionDrug;

    if (editPayload) {
      modal.componentInstance.drugToEdit = editPayload.drugToEdit;
      modal.componentInstance.atcGroup = editPayload.atcGroup;
    }

    modal.componentInstance.saveDrug.pipe(takeUntil(this.destroy$)).subscribe(({ atcGroup, drug }) => {
      this.store.dispatch(saveDrug({ drug, atcGroup, template: this.template }));
      modal.close();
    });

    modal.componentInstance.exitModal.pipe(takeUntil(this.destroy$)).subscribe(() => {
      modal.close();
    });

    this.destroy$.subscribe(() => modal.close());
  }

  drop(event: CdkDragDrop<Description[]>, groupIndex: number) {
    if (!event.isPointerOverContainer) {
      this.deleteDrug(groupIndex, event.previousIndex);
    }
    if (event.previousContainer.id === event.container.id) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateTreatments(this.groups, 'Drugs order updated.');
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex
      );
      this.updateTreatments(this.groups, 'Drugs order updated.');
    }
  }

  deleteGroup(groupIndex: number) {
    const group = this.groups[groupIndex];

    this.updateTreatments(
      this.groups.filter((item, idx) => idx !== groupIndex),
      `Group '${group.groupName}' was successfully deleted.`
    );
  }

  deleteDrug(groupIdx: number, drugIdx: number) {
    this.store.dispatch(removeDrug({ drugIdx, groupIdx, template: this.template }));
  }

  saveChanges(): void {
    this.updateTreatments(this.groups);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTreatments(groups: Treatments.Drug.Group[], msg?: string) {
    this.store.dispatch(setActiveTreatmentsRecordGroups({ template: this.template, groups }));
    this.cd.detectChanges();
    this.treatmentChange.next(msg);
  }

}
