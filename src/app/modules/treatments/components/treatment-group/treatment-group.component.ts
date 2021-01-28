import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { CdkDragDrop, CdkDragEnter } from '@angular/cdk/drag-drop';
import { take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
type Description = Treatments.Drug.Description | Treatments.NonDrug.Description;
type Group = Treatments.Drug.Group | Treatments.NonDrug.Group;

@Component({
  selector: 'mica-treatment-group',
  templateUrl: './treatment-group.component.html',
  styleUrls: ['./treatment-group.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreatmentGroupComponent implements OnDestroy {

  @Input() group: Group;
  @Input() isDrugTreatment: boolean;
  @Input() isPrescription: boolean;
  @Input() template: Treatments.Types.Template;

  @Output() renameGroup: EventEmitter<string> = new EventEmitter<string>();
  @Output() deleteGroup: EventEmitter<void> = new EventEmitter<void>();
  @Output() deleteTreatment: EventEmitter<number> = new EventEmitter<number>();
  @Output() addTreatment: EventEmitter<{ treatment: Description, details?: Treatments.Types.TreatmentTypeDescTemplate }> = new EventEmitter();
  @Output() drop: EventEmitter<CdkDragDrop<Description[]>> = new EventEmitter();
  @Output() saveChanges: EventEmitter<void> = new EventEmitter<any>();
  @Output() editTreatment: EventEmitter<Description> = new EventEmitter<Description>();

  destroy$: Subject<void> = new Subject();
  activeTreatmentIdx: number | null = null;

  constructor(private matDialog: MatDialog) { }

  get activeTreatment(): Description | undefined {
    const treatments = this.group && (this.group.drugs || this.group.nonDrugs);

    return treatments && treatments[<number>this.activeTreatmentIdx];
  }

  get groupItems(): Description[] | Treatments.Types.TreatmentTypeDescTemplate[] {
    if (!this.group) return [];

    if (!this.isDrugTreatment) {
      return this.group.nonDrugs ? this.group.nonDrugs.reduce(
        (res, desc) => {
          const { sourceInfo } = desc;
          const details = this.getTreatmentDetailsById(desc.typeDescID);

          details && res.push({ ...details, sourceInfo });
          return res;
        },
        <Treatments.NonDrug.Description[]>[]
      ) : [];
    }

    return this.group.drugs || [];
  }

  trackByFunc(index: number, item: any) {
    return index;
  }

  setActiveTreatmentIdx(idx: number | null) {
    this.activeTreatmentIdx = idx;
  }

  onDrag(event: CdkDragEnter<Description[]>) {
    event.item.dropped.pipe(take(1)).subscribe((dropEvent: CdkDragDrop<Description[]>) => {
      const curContainer = dropEvent.container;
      const prevContainer = dropEvent.previousContainer;
      const prevIdx = dropEvent.previousIndex;

      if (curContainer.id === prevContainer.id || this.activeTreatmentIdx === null) return;

      if (this.activeTreatmentIdx === prevIdx) {
        this.setActiveTreatmentIdx(null);
      } else if (this.activeTreatmentIdx > prevIdx) {
        this.setActiveTreatmentIdx(this.activeTreatmentIdx - 1);
      }
    });
  }

  onDrop(event: CdkDragDrop<Description[]>) {

    const curIdx = event.currentIndex;
    const prevIdx = event.previousIndex;
    const curContainer = event.container;
    const prevContainer = event.previousContainer;
    const isTheSameContainer = curContainer.id === prevContainer.id;

    if (isTheSameContainer && curIdx === prevIdx) return;

    this.drop.next(event);

    if (this.activeTreatmentIdx === null) return;

    if (isTheSameContainer) {
      if (prevIdx === this.activeTreatmentIdx) {
        this.setActiveTreatmentIdx(curIdx);
      } else if (prevIdx < this.activeTreatmentIdx && curIdx >= this.activeTreatmentIdx) {
        this.setActiveTreatmentIdx(this.activeTreatmentIdx - 1);
      } else if (prevIdx > this.activeTreatmentIdx && curIdx <= this.activeTreatmentIdx) {
        this.setActiveTreatmentIdx(this.activeTreatmentIdx + 1);
      }

    } else if (curIdx <= this.activeTreatmentIdx) {
      this.setActiveTreatmentIdx(this.activeTreatmentIdx + 1);
    }
  }

  onRemoveTreatmentClick(idx: number) {
    const dialogRef = this.matDialog.open(ConfirmationModalComponent);

    dialogRef.componentInstance.messageText = `Do you really want to remove the ${this.isDrugTreatment ? 'drug' : 'non-drug'} from the treatment?`;
    dialogRef.componentInstance.cancelText = 'Cancel';
    dialogRef.componentInstance.confirmText = 'Yes';

    dialogRef.afterClosed().subscribe(res => {
      if (res) this.deleteTreatment.next(idx);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTreatmentDetailsById(treatmentId: number): Treatments.Types.TreatmentTypeDescTemplate | undefined {
    return this.template && this.template.treatmentTypeDesc.find(treatment => treatment.typeDescID === treatmentId);
  }
}
