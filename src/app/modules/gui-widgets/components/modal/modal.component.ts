import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "mica-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnInit {
  @Input() data: {
    title: string;
    body: string;
    actionTxt: string;
    actionName: string;
    cancelTxt: string;
  };

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

}
