import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { MatDialog } from '@angular/material';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {
  removeNonDrug,
  saveNonDrug,
  setActiveTreatmentsRecordGroups
} from 'app/modules/treatments/state/treatments.actions';
import { NgRedux } from '@angular-redux/store';
import Description = Treatments.NonDrug.Description;
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NonDrugDialogComponent } from './non-drug-dialog/non-drug-dialog.component';

@Component({
  selector: 'mica-non-drug-treatment',
  templateUrl: './non-drug-treatment.component.html',
  styleUrls: ['./non-drug-treatment.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class NonDrugTreatmentComponent {
  @Input() template: Treatments.Types.Template;
  @Input() readonly groups: Treatments.NonDrug.Group[];
  @Output() treatmentsChange: EventEmitter<string> = new EventEmitter();

  helpText = 'You can create a group by clicking the button to the left.' +
    ' If you would like to change the name of a group simply click on it.' +
    ' The items in each list can also be dragged and dropped into the correct positioning.' +
    ' You can also Delete them by dragging them out of a box.';

  private destroy$: Subject<void> = new Subject<void>();

  constructor(public matDialog: MatDialog,
              private treatmentService: TreatmentsApiService,
              private cd: ChangeDetectorRef,
              private s: NgRedux<State.Root>,
              private store: Store<State.Root>) {
  }

  openNonDrugForm(editPayload?: { nonDrugToEdit: Treatments.NonDrug.Description, atcGroup: Treatments.AtcGroup } ) {
    const modal = this.matDialog.open(NonDrugDialogComponent);

    if (editPayload) {
      modal.componentInstance.nonDrugToEdit = editPayload.nonDrugToEdit;
      modal.componentInstance.atcGroup = editPayload.atcGroup;
    }

    modal.componentInstance.nonDrugTypeDescList = this.template.treatmentTypeDesc;

    modal.componentInstance.exitModal.pipe(takeUntil(this.destroy$)).subscribe(() => {
      modal.close();
    });

    modal.componentInstance.saveNonDrug.pipe(takeUntil(this.destroy$)).subscribe(({ atcGroup, nonDrug }) => {
      this.store.dispatch(saveNonDrug({ nonDrug, atcGroup, template: this.template }));
      modal.close();
    });

    this.destroy$.subscribe(() => modal.close());
  }

  drop(event: CdkDragDrop<Description[]>, groupIndex: number) {
    if (!event.isPointerOverContainer) {
      this.deleteNonDrug(groupIndex, event.previousIndex);
    }

    if (event.previousContainer.id === event.container.id) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateTreatments(this.groups, 'Treatments order updated.');

    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex
      );
      this.updateTreatments(this.groups, 'Treatments order updated.');
    }
  }

  deleteGroup(groupIndex: number) {
    const group = this.groups[groupIndex];

    this.updateTreatments(
      this.groups.filter((item, idx) => idx !== groupIndex),
      `Group '${group.groupName}' was successfully deleted.`
    );
  }

  saveChanges() {
    this.updateTreatments(this.groups);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  deleteNonDrug(groupIdx: number, nonDrugIdx: number) {
    this.store.dispatch(removeNonDrug({ nonDrugIdx, groupIdx, template: this.template }));
  }

  trackByFunc(index: number) {
    return index;
  }

  private updateTreatments(groups: Treatments.NonDrug.Group[], msg?: string) {
    this.store.dispatch(setActiveTreatmentsRecordGroups({ template: this.template, groups }));
    this.cd.detectChanges();
    this.treatmentsChange.next(msg);
  }
}
