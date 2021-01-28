import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import Description = Treatments.Drug.Description;
type Group = Treatments.NonDrug.Group | Treatments.Drug.Group;

@Component({
  selector: 'mica-treatment-group',
  template: '<div></div>'
})
export class MockTreatmentGroupComponent {
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
}
