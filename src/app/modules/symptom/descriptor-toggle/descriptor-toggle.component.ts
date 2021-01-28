import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from "@angular/core";
import { NgRedux } from "@angular-redux/store";
import { TOGGLE_DESCRIPTOR } from "../../../state/nav/nav.actions";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "mica-descriptor-toggle",
  templateUrl: "./descriptor-toggle.component.html",
  styleUrls: ["./descriptor-toggle.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DescriptorToggleComponent implements OnInit, OnDestroy {
  @Input() hasBodySelector = false;
  @Input() descriptorFile: string;
  @Input() value: string;
  @Input() antithesis: string;
  @Output() toggleDescriptor: EventEmitter<boolean> = new EventEmitter();

  constructor(private store: NgRedux<State.Root>,
              private cd: ChangeDetectorRef) {}

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  @HostListener("click")
  onToggleDescriptor() {
    this.toggleDescriptor.emit(true);
  }

  get descriptorBackground(): string {
    return `url(${environment.production || environment.pilot ? "/MICA" : ""}/assets/img/descriptors/${this.hasBodySelector ? "external-front.png" : this.descriptorFile})`;
  }

}
