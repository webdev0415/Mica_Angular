import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  OnChanges,
  EventEmitter,
  OnInit, OnDestroy
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes
} from '@angular/animations';
import { FormArray } from '@angular/forms';
import * as _ from 'lodash';
import { Subscription, BehaviorSubject } from 'rxjs';
import { compactErrorCollection } from '../../../util/forms/errors';
import { from } from 'rxjs/observable/from';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  animations: [
    trigger('slideInOutSymptom', [
      state('in', style({
        opacity: 1,
        'max-height': '100%',
      })),
      state('out', style({
        opacity: 0,
        'max-height': '0',
      })),
      transition('* => in', [
        animate('0.5s ease-in', keyframes([
          style({opacity: 0, 'max-height': 0, offset: 0}),
          style({opacity: 0.3, 'max-height': 70, offset: 0.3}),
          style({opacity: 1, 'max-height': 5000, offset: 1.0})
        ]))
      ]),
      transition('* => remove', [
        animate('0.5s ease-out', keyframes([
          style({opacity: 1, 'max-height': 100, offset: 0}),
          style({opacity: 0, 'max-height': 70, offset: 0.3}),
          style({opacity: 0, 'max-height': 0, offset: 1.0})
        ]))
      ])
    ])
  ],
  selector: 'mica-symptom-rows',
  templateUrl: './rows.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() readOnly = false;
  @Input() readonly symptomData: Symptom.Data;
  @Input() readonly isParentFocused: boolean;
  @Input() rowsFormArray: FormArray;
  @Input() maxRowsReached: boolean | number;
  @Input() readonly dataStoreRefTypes: Workbench.DataStoreRefTypesDictionary;
  @Output() errors: EventEmitter<Symptom.RowError[]> = new EventEmitter();

  private errorsPublisherSrc: BehaviorSubject<Symptom.RowError[]> = new BehaviorSubject([]);
  errorsPublisher = from(this.errorsPublisherSrc);
  private rowsAnimate: string[] = [];
  private subs: Subscription[] = [];

  get allMultiplierValues() {
    const tmp = _.map(
      this.rowsFormArray.value,
      (formValue: any) =>
        _.map(
          formValue['multiplier'],
          (value: any) => {
            if (typeof value === 'string') {
              return value.split(',');
            } else {
              // return array if the value is numeric as the it is being flattened above
              return [value];
            }
          }
        )
    );
    return _.flattenDepth(tmp, 2);
  }

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnChanges() {
    if (typeof this.maxRowsReached === 'number') {
      let count = this.maxRowsReached as number;
      this.rowsFormArray.value.forEach((element: any, index: number) => {
        if (count && element.multiplier && !element.multiplier[0]) {
          count--;
          this.onRemoveRow(index);
        }
      });
    }
  }

  ngOnInit() {
    this.rowsAnimate = _.fill(Array(this.rowsFormArray.length), 'in');

    const rowsCtrlSub = this.rowsFormArray.valueChanges.subscribe(value => {
      if (this.readOnly) {
        return;
      }
      const newRowsLength = value.length;
      const oldRowsLength = this.rowsAnimate.length;

      if (newRowsLength !== oldRowsLength) {
        if (newRowsLength > oldRowsLength) {
          // animate new row
          this.rowsAnimate.push('in');
        } else {
          // prune rowsAnimate with the deleted row
          this.rowsAnimate = _.without(this.rowsAnimate, 'remove');
        }
        this.cd.detectChanges();
      }
    });

    const errorPublisherSub = this.errorsPublisher
      .pipe(
        distinctUntilChanged((x, y) => _.isEqual(x, y))
      )
      .subscribe(errs => this.errors.emit(errs));

    this.subs.push(rowsCtrlSub, errorPublisherSub);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  trackByFn(index: number, value: Symptom.RowValue): any {
    return index && value;
  }

  /**
   * Animations
   */

  onRowAnimationEnd(index: number): void {
    const hasRemovals = ~_.indexOf(this.rowsAnimate, 'remove');
    const hasNewRows = ~_.indexOf(this.rowsAnimate, 'in');
    if (hasRemovals) {
      // a row has been deleted
      this.rowsFormArray.removeAt(index);
      // update errors
      this.errorsPublisherSrc.next(_.reduce(
        this.errorsPublisherSrc.value,
        (errors, err) => {
          if (err.index === index) return errors;
          if (err.index > index) return [...errors, {...err, index: err.index - 1}];

          return [...errors, err];
        },
        [] as Symptom.RowError[]));
    } else if (hasNewRows) {
      // new rows have a state of 'in'
      // make sure rows don't get animated again
      // rows are added by symptomComponent
      this.rowsAnimate[index] = 'stable';
    }
  }

  rowAnimateState(index: number): string {
    return this.rowsAnimate[index];
  }

  /**
   * Event Listeners
   */

  onRemoveRow(index: number) {
    this.rowsAnimate[index] = 'remove';
  }

  onRowError(error: Symptom.RowError, rowIndex: number): void {
    compactErrorCollection(error, rowIndex, this.errorsPublisherSrc);
  }
}
