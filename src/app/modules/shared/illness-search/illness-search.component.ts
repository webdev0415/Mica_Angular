import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import SearchValue = Illness.SearchValue;

@Component({
  selector: 'mica-illness-search',
  templateUrl: './illness-search.component.html',
  styleUrls: ['./illness-search.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllnessSearchComponent implements OnInit, OnDestroy {
  @Input() searchResults: SearchValue[];
  @Input() showIllnessGroupToggle = false;
  @Input() combineWithSymptoms = false;

  @Output() searchIllness: EventEmitter<string> = new EventEmitter();

  @Output() selectIllness: EventEmitter<string> = new EventEmitter();
  @Output() selectSymptom: EventEmitter<string> = new EventEmitter();

  searchCtrl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  groupToggleCtrl: FormControl = new FormControl(false);

  errorStateMatcher: ErrorStateMatcher = { isErrorState: () => false };

  private destroy$: Subject<void> = new Subject<void>();

  constructor() { }

  ngOnInit() {
    this.searchCtrl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$),
      map(val => {
        if (typeof val === 'string') {
          const term = val.toUpperCase();

          this.searchCtrl.setValue(term, { emitEvent: false });
          this.groupToggleCtrl.setValue(false, { emitEvent: false });
          this.groupToggleCtrl.disable();

          return term;
        } else {
          const { name } = val;

          if (/^SYMPT[0-9]*/i.test(name)) {
            this.groupToggleCtrl.setValue(false, { emitEvent: false });
            this.groupToggleCtrl.disable();

            this.selectSymptom.next(name);
          } else {
            this.groupToggleCtrl.enable();
            this.selectIllness.next(name);
          }

          return val;
        }
      }),
      debounceTime(500)
    ).subscribe(this.handleSearchTyping.bind(this));

    this.groupToggleCtrl.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
      this.searchCtrl.setValue(this.searchCtrl.value, { emitEvent: false });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  displayWithFn = (item: string | SearchValue): string => {
    if (typeof item === 'string') {
      return item;

    } else {
      const isIllnessGroup = this.groupToggleCtrl.value;

      return isIllnessGroup ? `${item.name.split('.')[0]}.X` : item.name;
    }
  };

  private handleSearchTyping(input: string | SearchValue) {
    if (typeof input === 'string') {
      if (this.searchCtrl.valid) {
        this.searchIllness.next(input);
      } else {
        this.searchResults = [];
      }
    }
  }
}
