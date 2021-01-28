import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

type RecordType = 'symptom' | 'illness';

@Component({
  selector: 'mica-source-removal-modal',
  templateUrl: './source-removal-modal.component.html',
  styleUrls: ['./source-removal-modal.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SourceRemovalModalComponent implements OnInit {

  @Input() recordType: RecordType;
  @Input() treatmentType: 'drug' | 'non-drug';
  @Input() entityType: 'treatment' | 'record';

  constructor(private activeModal: NgbActiveModal) {
  }

  removeFromRecord(recordType: RecordType) {
    this.activeModal.close(recordType);
  }

  removeFromTreatment(full = false) {
    if (full) {
      this.activeModal.close('treatment');
    } else {
      this.activeModal.close(this.treatmentType);
    }
  }

  cancel() {
    this.activeModal.dismiss();
  }

  ngOnInit() {
  }
}
