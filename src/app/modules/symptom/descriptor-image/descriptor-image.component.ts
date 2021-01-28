import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { Observable, Subscription, of } from "rxjs";
import * as _ from "lodash";
import { DataService } from "../services/data.service";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { map, switchMap } from "rxjs/operators";

@Component({
  selector: "symptom-descriptor-image",
  templateUrl: "./descriptor-image.component.html",
  styleUrls: ["./descriptor-image.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DescriptorImageComponent implements OnInit, OnDestroy {
  @Input() hasBodySelector = false;
  @Input() descriptorFile: string;
  @Input() id: string;
  @Input() rowIndex: number;
  @Input() value: string;
  @Input() bodyPart = "";
  @Output() select: EventEmitter<string> = new EventEmitter();
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  svgShapes: MICA.BodyImage.ViewSVGMap;
  private subs: Subscription[] = [];
  get state() { return this.s.getState(); }
  active: Observable<boolean>;

  constructor(private s: NgRedux<State.Root>,
              private cd: ChangeDetectorRef,
              private data: DataService,
              private http: HttpClient) { }

  ngOnInit() {
    this.active = this.data
      .isActiveDescriptor$(this.id, this.rowIndex)
      .pipe(
        switchMap(this.loadPainSvgShapes.bind(this))
      );
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
    this.cd.detach();
  }

  onCloseDescriptor(): void {
    this.close.emit(true);
  }

  get descriptorBackground(): string {
    /* istanbul ignore next */
    return `${environment.production || environment.pilot
              ? "/MICA" : ""}/assets/img/descriptors/${this.hasBodySelector ? "external-front.png" : this.descriptorFile}`;
  }

  get valueText() {
    return this.value ? this.value.split(",").join(", ") : "";
  }

  private onBodyPartSelect(input: MICA.BodyImage.Output) {
    if (input.selectedPath[2]) this.select.emit(input.selectedPath[2]);
  }

  private getPainShapes(active: boolean) {
    return this.http.get("assets/mappings/svgShapesPain.json")
      .pipe(
        map(this.setSvgShapes.bind(this, active))
      )
  }

  private setSvgShapes(active: boolean, svgShapes: MICA.BodyImage.ViewSVGMap) {
    this.svgShapes = svgShapes;
    return of(active);
  }

  private loadPainSvgShapes(active: boolean) {
    if (this.svgShapes) {
      return of(active);
    }
    const loadShapes = this.getPainShapes.bind(this, active);
    return loadShapes();
  }

}
