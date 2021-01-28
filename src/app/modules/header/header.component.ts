import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NgRedux, select } from '@angular-redux/store';
import { appVersion } from 'app/state/global/global.selectors';

@Component({
  selector: 'mica-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  @select(appVersion) appVersion$: Observable<string>;
  @select([ 'global', 'currentApp' ]) currentApp$: Observable<State.AppName>;

  links: any = {
    treatments : [
      {
        route: '/treatments',
        title: 'Inspector'
      }
    ],
    symptomLink: [
    {
      route: '/symptom-links',
      title: 'View Data'
    }
    ],
    mica: [
      {
        route: '/workbench',
        title: 'Symptoms'
      },
      {
        route: '/templates',
        title: 'Templates'
      },
      {
        route: '/review/inspector',
        title: 'Inspector'
      },
      {
        route: '/groups',
        title: 'Groups'
      },
      {
        route: '/approved-illnesses',
        title: 'Approved Illnesses'
      }
    ],
    mita: [
      {
        route: '/',
        title: 'Summary'
      },
      {
        route: '/',
        title: 'Users'
      },
      {
        route: '/',
        title: 'Collectors'
      },
      {
        route: '/',
        title: 'Reviewers'
      },
      {
        route: '/',
        title: 'Tasks'
      },
      {
        route: '/',
        title: 'Tracking'
      },
      {
        route: '/',
        title: 'Assignments'
      },
      {
        route: '/',
        title: 'Data-frame Generation'
      },
    ]
  };



  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {
  }

  get appRouting$(): Observable<any[]> {
    return this.currentApp$.pipe(map(app => this.links[app]));
  };

  ngOnInit() {
  }
}
