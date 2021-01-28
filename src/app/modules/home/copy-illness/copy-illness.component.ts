import { upsertIllness, upsertIllnessNorm } from "app/state/workbench/workbench.actions";
import { illnessValues } from "app/state/workbench/workbench.selectors";
import { isReviewer } from "app/state/user/user.selectors";
import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import * as _ from "lodash";
import { select, NgRedux } from "@angular-redux/store";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalComponent } from "../../gui-widgets/components/modal/modal.component";
import { postMsg } from "app/state/messages/messages.actions";
import { map } from "rxjs/operators";
import { of } from "rxjs";
import { denormalizeIllnessValue } from "app/state/denormalized.model";

export interface SelectableIllness {
  name: string;
  value: Illness.Normalized.IllnessValue;
}

@Component({
  selector: "mica-copy-illness",
  templateUrl: "./copy-illness.component.html",
  styleUrls: ["./copy-illness.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyIllnessComponent implements OnInit, OnDestroy {
  @Input() illness: Illness.Data;

  @select(illnessValues) illnessValues: Observable<Illness.Normalized.IllnessValue[]>;
  isReviewer = isReviewer(this.state);
  edit = false;

  private illnesses: Observable<SelectableIllness[]> = of([]);
  private get state() { return this.s.getState() }

  trackByFn(index: number, row: SelectableIllness): number { return index }

  constructor(private s: NgRedux<State.Root>,
              private modalService: NgbModal) { }

  ngOnInit() {
    this.illnesses = this.illnessValues
      .pipe(map(data => _.map(data, d => ({ name: d.form.idIcd10Code, value: d }))));
  }

  ngOnDestroy() {
  }

  illnessesToCopy(idIcd10Code: string): Observable<Array<any>> {
      return this.filteredIllnesses(idIcd10Code)
        .pipe(map(this.denormalizeIllnesses.bind(this)));
  }

  thereAreIllnessesToCopy(idIcd10Code: string) {
    return this.filteredIllnesses(idIcd10Code).pipe(map(illnesses => !!illnesses.length));
  }

  filterCopyItems(items: MICA.SelectableEl[], type: string): Array<MICA.SelectableEl> {
    const filter = _.memoize(_.filter, (cache: MICA.SelectableEl[]) => cache.length !== items.length);
    return filter(items, i => i.origin === type);
  }

  onCopySelect(emitter: EventEmitter<MICA.SelectableEl>, item: MICA.SelectableEl) {
    emitter.emit({ name: item.name, value: item.value.idIcd10Code });
    this.confirmCopy(item);
    this.edit = false;
  }

  private confirmCopy(selected: MICA.SelectableEl | SelectableIllness) {
    const illStatesNames = this.state.global.illStates;
    const state = this.isReviewer ? illStatesNames.readyForReview : illStatesNames.pending;
    const copyIllness: Illness.FormValue = selected.value.idIcd10Code ?
      {
        ...selected.value,
        name: this.illness.name,
        idIcd10Code: this.illness.idIcd10Code,
        version: this.illness.version,
        state
      } : undefined;
    const copyIllnessNorm: Illness.Normalized.IllnessValue = !selected.value.idIcd10Code ?
      {
        ...selected.value,
        form: {
          ...selected.value.form,
          name: this.illness.name,
          idIcd10Code: this.illness.idIcd10Code,
          version: this.illness.version,
          state
        }
      } : undefined;
    const modalRef = this.modalService.open(ModalComponent, {size: "lg"});
    const idIcd10CodeCopy = copyIllness ? copyIllness.idIcd10Code : copyIllnessNorm.form.idIcd10Code;
    const versionCopy = copyIllness ? copyIllness.version : copyIllnessNorm.form.version;
    const idIcd10CodeFrom = copyIllness ? selected.value.idIcd10Code : selected.value.form.idIcd10Code;
    const versionFrom = copyIllness ? selected.value.version : selected.value.form.version;

    modalRef.componentInstance.data = {
      title: "Are you sure?",
      body: `Copying data from an illness into another is a destructive action.
        If you have already completed some data for ${idIcd10CodeCopy} (v${versionCopy}), it will be lost!`,
      actionTxt: `Yes, copy data from ${idIcd10CodeFrom} (v${versionFrom})`,
      actionName: "revert",
      cancelTxt: `Do not copy data`
    };

    modalRef.result
      .then(() => {
        this.s.dispatch(copyIllness ? upsertIllness(copyIllness) : upsertIllnessNorm(copyIllnessNorm));
        this.s.dispatch(postMsg(
          `${idIcd10CodeFrom} copied successfully into ${idIcd10CodeCopy}`,
          { type: "success" }
        ));
      })
      .catch(reason => {
        if (reason !== "Cross click" && reason !== "cancel") {
          this.s.dispatch(postMsg(
            `Unable to copy ${idIcd10CodeFrom} into ${idIcd10CodeCopy}`,
            {type: "error"}
          ));
        }
        this.edit = false;
      });
  }

  private denormalizeIllnesses(illnesses: SelectableIllness[]): Array<any> {
      return illnesses.map(this.denormalizeIllness.bind(this))
  }

  private denormalizeIllness(illness: SelectableIllness): any {
    const denormalized = denormalizeIllnessValue(illness.value);
    return {
      ...illness,
      value: denormalized
    };
  }

  private filteredIllnesses(idIcd10Code: string) {
    return this.illnesses.pipe(
      map(is => _.reject(is, i => i.value.form.idIcd10Code === idIcd10Code))
    );
  }
}
