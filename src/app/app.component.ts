import { ImageLoadingService } from './services/image-loading.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { Observable } from 'rxjs';
import { CountryService, SourceService } from './services';
import { NgRedux, select } from '@angular-redux/store';
import { COUNTRY_LOAD } from './state/global/global.actions';
import { AuthService, IdleDetectorService } from './services';
import stateUpdater from './state/util/updater';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { activeIllnessValue } from './state/workbench/workbench.selectors';
import { setSymptomsSources } from './state/source/source.actions';
import { Store } from '@ngrx/store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'mica-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  @select([ 'global', 'bootstrapped' ]) bootstrapped$: Observable<boolean>;
  @select([ 'global', 'currentApp' ]) currentApp$: Observable<State.AppName>;
  @select([ 'global', 'countries' ]) countries$: Observable<MICA.Country[]>;
  @select(activeIllnessValue) activeIllnessValue$: Observable<Illness.Normalized.IllnessValue>;

  authenticated$ = this.auth.isAuthenticated$;
  private loggedIn: boolean | null = null;

  constructor(private countrySvc: CountryService,
              private auth: AuthService,
              private idleDetector: IdleDetectorService,
              private imageLoader: ImageLoadingService,
              private sourceService: SourceService,
              private s: NgRedux<State.Root>,
              private store: Store<State.Root>,
              private cd: ChangeDetectorRef,
              private router: Router
  ) {
  }

  ngOnInit() {
    window.onmouseout = () => {
      if (this.loggedIn === true) {
        window.onbeforeunload = (evt) => {
          let e: any;
          e = evt || window.event;
          if (e) {
            e.returnValue = '';
          }
          return '';
        };
        window.onunload = () => {
          this.auth.logout();
        };
      }
    };
    window.onmousemove = () => {
      window.onbeforeunload = () => {};
      window.onunload = () => {};
    };

    if (stateUpdater.isVersionOld(this.s.getState()).length) {
      this.s.dispatch({type: 'RESET_STATE'});
    }

    this.auth.isAuthenticated$
      .subscribe(u => {
        this.loggedIn = u;
        if (!u) {
          this.idleDetector.stop();
          // without this, header remains
          setTimeout(() => {
            this.cd.detectChanges();
          },         1);
        } else {
          this.idleDetector.start();
        }
      });
    this.countries$
      .pipe(
        filter(countries => !countries || countries.length === 0),
        switchMap(countries => {
          return this.countrySvc.countries$;
        })
      )
      .subscribe(countries => {
        this.s.dispatch({
          type: COUNTRY_LOAD,
          countries: countries
        });
      });
    this.imageLoader.preloadBodyImages()
      .subscribe(msg => console.log(msg), err => console.error('Unable to Preload Body Images'));

    this.router.events.subscribe((e) => {
      if (!(e instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });

    this.activeIllnessValue$
      .pipe(distinctUntilChanged((prev, next) => {
        const prevExists = !!prev;
        const nextExists = !!next;

        if ((!nextExists || !prevExists) || (prevExists !== nextExists)) {
          return false;
        }

        const isIcdDifference = prev.form.idIcd10Code === next.form.idIcd10Code;
        const isVersionsDifference = prev.form.version === next.form.version;
        const stateDifference = prev.form.state === next.form.state;

        return isIcdDifference && isVersionsDifference && stateDifference;
      }))
      .subscribe(illness => {
        if (illness) {
          const { idIcd10Code, version, state } = illness.form;

          this.sourceService.getSymptomSourcesByIllness(idIcd10Code, version, state).subscribe(sources => {
            this.store.dispatch(setSymptomsSources({ records: sources }))
          });
        } else {
          this.store.dispatch(setSymptomsSources({ records: [] }));
        }
      });
  }
}
