import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from "@angular/core";

@Component({
  selector: "mica-badge-icon",
  templateUrl: "./badge-icon.component.html",
  styleUrls: ["./badge-icon.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeIconComponent implements OnInit {
  @Input() title: string;
  @Input() value: any;
  private icons: {[title: string]: string} = {
    antithesis: "settings_ethernet",
    criticality: "sim_card_alert",
    edit: "edit",
    question: "info"
  }
  get icon() { return this.icons[this.title]; }

  constructor() { }

  ngOnInit() {
  }

}
