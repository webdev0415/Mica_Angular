import { isReviewer } from '../../../../state/user/user.selectors';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { NgRedux, select } from '@angular-redux/store';
import * as _ from 'lodash';
import { IllnessService } from '../../../../services';
import { changeNavBar } from '../../../../state/nav/nav.actions';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'mica-header-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent implements OnInit, OnDestroy {
  @select([ 'nav', 'navBar']) navBar$: Observable<MICA.NavBarType>;
  isReviewer = isReviewer(this.s.getState());
  navBars: MICA.NavBarType[];
  tabNames: MICA.NavBarType[];
  private subs: Subscription[] = [];
  private get state() { return this.s.getState(); }
  get activeNavBar(): string { return this.state.nav.navBar || 'symptoms'; }

  constructor(private s: NgRedux<State.Root>,
              private illness: IllnessService,
              private cd: ChangeDetectorRef,
              private router: Router) {
    this.subs.push(this.router.events
      .pipe(
        filter(ev => ev instanceof NavigationEnd)
      )
      .subscribe((nav: NavigationEnd) => {
        const navBar = this.parceUrl(nav.url);
        this.s.dispatch(changeNavBar(navBar));
      }))
  }

  ngOnInit() {
    this.navBars = this.state.nav.tabs;
    this.tabNames = this.state.nav.tabs;
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }

  parseTabName(tab: string): string {
    if (tab === 'inspector')
      return '/review/inspector';

    if (tab === 'groups')
      return '/groups';

    return tab;
  }

  parceUrl(url: string): string {
    if (/^\/treatments/.test(url))
      return 'treatments';

    if (/^\/templates/.test(url))
      return 'templates';

    if (/inspector$/.test(url))
      return 'inspector';

    if (/^\/groups/.test(url))
      return 'groups';

    return 'symptoms' ;
  }
}
