import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input, SimpleChanges, OnChanges
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'mica-select-non-drug',
  templateUrl: './select-non-drug.component.html',
  styleUrls: ['./select-non-drug.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectNonDrugComponent implements OnChanges {
  @Input() nonDrugTypeDescList: Treatments.Types.TreatmentTypeDescTemplate[];
  @Input() nonDrugTypeDescCtrl: FormControl;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    const { nonDrugTypeDescList, nonDrugTypeDescIdCtrl } = changes;

    if ((nonDrugTypeDescList || nonDrugTypeDescIdCtrl) && (this.nonDrugTypeDescList && this.nonDrugTypeDescCtrl && this.nonDrugTypeDescCtrl.value === null)) {
      const defaultValue = this.nonDrugTypeDescList.find(item => item.defaultValue);

      if (defaultValue) {
        this.nonDrugTypeDescCtrl.setValue(defaultValue);
      }
    }
  }
}
