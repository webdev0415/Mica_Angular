import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { AddedSourcePayload } from '../../app/modules/shared/source-form/source-form.component';

@Component({
  selector: 'mica-source-form',
  template: '<div></div>'
})
export class MockSourceFormComponent {
  @Input() recordType: 'symptom' | 'illness';
  @Input() treatmentType: 'drug' | 'non-drug';
  @Input() entityType: 'treatment' | 'record';
  @Input() sourceCtrlArray: FormArray;
  @Input() sourcesData: SourceInfo.SourcesDictionary;
  @Input() readOnly = false;
  @Input() noSourceRemovalOptions = false;
  @Input() allowNewView = false;

  @Output() sourceAdded: EventEmitter<AddedSourcePayload> = new EventEmitter();
  @Output() sourceRemoved: EventEmitter<{ idx: number, source: SourceInfo.Source, action?: SourceInfo.Action }> = new EventEmitter();
}
