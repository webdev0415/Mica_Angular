import { Observable } from "rxjs/Observable";
import { illnessInconsistentMsgs } from "app/state/workbench/workbench.selectors";
import { NgRedux } from "@angular-redux/store";
import { Component, OnInit, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: "mica-validation-icon",
  templateUrl: "./icon.component.html",
  styleUrls: ["./icon.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent implements OnInit {
  @Input() idIcd10Code: string;
  @Input() version: number;
  errors: Observable<string[]>;

  constructor(private s: NgRedux<State.Root>) { }

  ngOnInit() {
    if (!this.idIcd10Code) {
      console.error("An illness is needed to validate: ");
      return;
    }
    this.errors = this.s.select(illnessInconsistentMsgs(this.idIcd10Code, this.version));
  }

}
