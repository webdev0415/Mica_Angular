import { Injectable, OnDestroy } from "@angular/core";
import { Title } from "@angular/platform-browser";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent, RouterState} from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { NgRedux, select } from "@angular-redux/store";
import * as _ from "lodash";
import {filter, switchMap} from "rxjs/operators";

@Injectable()
export class TitleService implements OnDestroy {
  private subscriptions: Subscription[] = [];
  private appTitle: string;
  @select([ "nav", "title" ]) title$: Observable<string>;

  constructor(private title: Title,
              private route: ActivatedRoute,
              private router: Router) {

    const titleSubscription = this.title$
      .pipe(
        switchMap(this.setAppTitle.bind(this)),
        filter(this.isNavigationEnd)
      )
      .subscribe(this.setPageTitle.bind(this));

    this.subscriptions.push(titleSubscription);
  }

  get routerTitle(): string {
    return this.getTitle(this.router.routerState, this.router.routerState.root).join("-");
  }

  set pageTitle(section: string[]) {
    const titleArray = [this.appTitle, this.routerTitle, ...section];
    const withoutDuplicates = this.withoutDuplicates(titleArray);
    const newTitle = withoutDuplicates.join(" - ");
    this.title.setTitle(newTitle);
  }

  /**
   *
   * Title will be set from the component
   * @private
   *
   * @memberOf TitleService
   */
  private get pageHasOwnTitle(): boolean {
    return this.lastChild ? this.lastChild.snapshot.data["hasSection"] : false;
  }

  private get lastChild(): ActivatedRoute {
    const children = this.getChildren(this.router.routerState.root.children);
    if (!children) throw Error("Unable to get last child route");
    return children[0];
  }

  private getChildren(children: ActivatedRoute[]) {
    return _.reduce(children, (r, ch) => {
      return ch.children.length ? ch.children : ch;
    }, undefined) as ActivatedRoute[] | undefined;
  }

  private getTitle(state: any, parent: any): string[] {
    const data = [];

    if (parent && parent.snapshot && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent && parent.snapshot) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }
    const withoutDuplicates = this.withoutDuplicates(data);
    return withoutDuplicates;
  }

  ngOnDestroy() {
    _.each(this.subscriptions, sub => sub.unsubscribe());
  }

  private setAppTitle(appTitle: string) {
    this.appTitle = appTitle;
    return this.router.events;
  }

  private isNavigationEnd = (event: RouterEvent) => event instanceof NavigationEnd;

  private setPageTitle() {
    // remove duplicate titles sent via route data
    if (!this.pageHasOwnTitle) this.pageTitle = [];
  }

  private withoutDuplicates(arr: Array<string>): Array<string> {
    const items = arr || [];
    const withoutDuplicates = [];
    const cache = {} as any;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!cache[item]) {
        cache[item] = item;
        withoutDuplicates.push(item);
      }
    }
    return withoutDuplicates;
  }
}
