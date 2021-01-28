import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { activeIllnessID } from "../../../../state/workbench/workbench.selectors";
import { Observable } from "rxjs";

@Component({
  selector: "header-groups",
  templateUrl: "./groups.component.html",
  styleUrls: ["./groups.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsComponent implements OnInit {
  @select(activeIllnessID) activeIllnessCode$: Observable<string>;

  constructor( private s: NgRedux<State.Root>) { }

  ngOnInit() {
  }

}
