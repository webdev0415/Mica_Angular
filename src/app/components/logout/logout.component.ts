import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../services";

@Component({
  selector: "mica-logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent implements OnInit, OnDestroy {
  message: string;
  private subs: Subscription[] = [];

  constructor(private auth: AuthService,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.auth.logout();
    const routeDataSub = this.route.data
      .subscribe(data => this.message = data.message);
    this.subs.push(routeDataSub);
    const htmlNode = document.getElementsByTagName("html")[0];
    htmlNode.classList.add("logout");
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    const htmlNode = document.getElementsByTagName("html")[0];
    htmlNode.classList.remove("logout");
  }
}
